import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { getDatabase, ref, set, remove } from 'firebase/database'
import { logger } from '@/utils/logger'

export function useTaskActions() {
	const store = useAppStore()
	const router = useRouter()

	function createGuid() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0)
				.toString(16)
				.substring(1)
		}
		return (
			S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()
		).toLowerCase()
	}

	function pageCheck() {
		logger.log('checking page: ', store.user)
		if (!store.user) {
			logger.log('no user found')
			router.push('/login')
		}
	}

	async function moveTask(task, list) {
		const db = getDatabase(store.app)

		const listRef = ref(
			db,
			`${list}/${store.user.uid}/${task.id}`
		)

		// Deep clone first to avoid mutating reactive Proxy objects
		const plainTask = JSON.parse(JSON.stringify(task))
		let removeFromList

		switch (list) {
			case 'completed':
				removeFromList = 'tasks'
				plainTask.completedDateTime = new Date().toJSON()

				// Calculate duration if task was started (via schedule) but duration not yet set
				if (plainTask.actualStartTime && !plainTask.actualDuration) {
					plainTask.actualDuration = Math.round(
						(new Date() - new Date(plainTask.actualStartTime)) / 1000 / 60
					)
				}

				if (store.tasks.length === 1) {
					store.setTasks([])
				}
				break
			case 'tasks':
				removeFromList = 'completed'
				plainTask.completedDateTime = null

				if (store.completed.length === 1) {
					store.setCompleted([])
				}
				break
		}

		// Auto-create next recurrence instance when completing a recurring task
		if (list === 'completed' && plainTask.recurrence && shouldCreateNextInstance(plainTask)) {
			const today = new Date()
			const nextDate = calculateNextOccurrence(plainTask.recurrence, today)
			let datesToCreate = [nextDate]

			if (
				plainTask.recurrence.catchUpMissed &&
				plainTask.targetDateTime &&
				new Date(plainTask.targetDateTime) < today
			) {
				const missed = getMissedOccurrences(plainTask)
				datesToCreate = [...missed, nextDate]
			}

			for (const targetDate of datesToCreate) {
				const newInstance = buildRecurringInstance(plainTask, targetDate)
				const instanceRef = ref(db, `tasks/${store.user.uid}/${newInstance.id}`)
				await set(instanceRef, newInstance)
			}

			const nextLabel = new Date(nextDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
			store.showNotification({
				title: 'Next occurrence created',
				text: `"${plainTask.name}" will repeat on ${nextLabel}`
			})
		}

		await set(listRef, plainTask)
		removeTask(task, removeFromList)
		logger.log('moved task: ', plainTask)
		await rescoreActiveBacklog()
	}

	async function removeTask(task, list) {
		const db = getDatabase(store.app)
		const listRef = ref(
			db,
			`${list}/${store.user.uid}/${task.id}`
		)

		await remove(listRef)
		logger.log(`removed from ${list}: `, task)
	}

	async function cleanupDependsOn(deletedTaskId) {
		const db = getDatabase(store.app)
		const backlog = JSON.parse(JSON.stringify(store.tasks))
		for (const t of backlog) {
			if (t.dependsOn?.includes(deletedTaskId)) {
				t.dependsOn = t.dependsOn.filter(id => id !== deletedTaskId)
				const taskRef = ref(db, `tasks/${store.user.uid}/${t.id}`)
				await set(taskRef, t)
				logger.log(`cleaned dependsOn for task: ${t.name}`)
			}
		}
	}

	function detectCircularDependency(taskId, proposedDeps, allTasks) {
		const taskMap = {}
		for (const t of allTasks) {
			taskMap[t.id] = t
		}

		function canReach(currentId, targetId, visited) {
			if (currentId === targetId) return true
			if (visited.has(currentId)) return false
			visited.add(currentId)
			const current = taskMap[currentId]
			if (!current?.dependsOn?.length) return false
			return current.dependsOn.some(depId => canReach(depId, targetId, new Set(visited)))
		}

		return proposedDeps.some(depId => canReach(depId, taskId, new Set()))
	}

	function topologicalSort(tasks) {
		const taskIdSet = new Set(tasks.map(t => t.id))
		const inDegree = {}
		const adjList = {}

		for (const t of tasks) {
			inDegree[t.id] = inDegree[t.id] ?? 0
			adjList[t.id] = adjList[t.id] ?? []
			const activeDeps = (t.dependsOn ?? []).filter(id => taskIdSet.has(id))
			inDegree[t.id] += activeDeps.length
			for (const depId of activeDeps) {
				adjList[depId] = adjList[depId] ?? []
				adjList[depId].push(t.id)
			}
		}

		const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]))
		const queue = tasks.filter(t => inDegree[t.id] === 0)
		const sorted = []

		while (queue.length > 0) {
			const current = queue.shift()
			sorted.push(current)
			for (const dependentId of (adjList[current.id] ?? [])) {
				inDegree[dependentId]--
				if (inDegree[dependentId] === 0) {
					queue.push(taskMap[dependentId])
				}
			}
		}

		if (sorted.length < tasks.length) {
			const sortedIds = new Set(sorted.map(t => t.id))
			for (const t of tasks) {
				if (!sortedIds.has(t.id)) sorted.push(t)
			}
		}

		return sorted
	}

	async function saveScheduleToDatabase(schedule) {
		const db = getDatabase(store.app)
		const scheduleRef = ref(
			db,
			`schedule/${store.user.uid}`
		)

		// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
		const plainSchedule = JSON.parse(JSON.stringify(schedule))
		await set(scheduleRef, plainSchedule)
		logger.log('updated schedule: ', plainSchedule)
	}

	function getScheduleTasks(tasks, sessionInMins, includeBreaks) {
		const breakFrequency = store.account.settings?.breaks?.targetFrequency ?? store.defaultSettings.breaks.targetFrequency
		const breakLength = store.account.settings?.breaks?.length ?? store.defaultSettings.breaks.length
		const taskType = store.taskType

		// Exclude manually blocked tasks, then resolve which remaining tasks are
		// schedulable. A task is schedulable if all unmet deps are also schedulable
		// in this session (allowing A and B to both be scheduled with A first).
		const manuallyEligible = tasks.filter(t => !t.blocked)
		const completedIds = new Set(store.completed.map(t => t.id))
		let candidateIds = new Set(manuallyEligible.map(t => t.id))

		let changed = true
		while (changed) {
			changed = false
			for (const t of manuallyEligible) {
				if (!candidateIds.has(t.id)) continue
				const unmetDeps = (t.dependsOn ?? []).filter(id => !completedIds.has(id))
				if (unmetDeps.some(id => !candidateIds.has(id))) {
					candidateIds.delete(t.id)
					changed = true
				}
			}
		}

		const eligible = manuallyEligible.filter(t => candidateIds.has(t.id))
		const eligibleTasks = topologicalSort(eligible)
		const schedule = []
		let totalTaskTime = 0
		let currentTaskIndex = 0
		let timeSinceLastBreak = 0

		while (
			totalTaskTime < sessionInMins &&
			currentTaskIndex < eligibleTasks.length
		) {
			const task = eligibleTasks[currentTaskIndex]
			const taskLength = task.sizing

			if (totalTaskTime + taskLength <= sessionInMins) {
				// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
				schedule.push(JSON.parse(JSON.stringify(task)))
				totalTaskTime += taskLength
				timeSinceLastBreak += taskLength
			}

			if (includeBreaks && timeSinceLastBreak >= breakFrequency) {
				schedule.push({
					id: createGuid(),
					name: 'Take a break',
					sizing: breakLength,
					type: taskType.systemBreak
				})
				totalTaskTime += breakLength
				timeSinceLastBreak = 0
			}

			currentTaskIndex++
		}

		if (schedule.length > 0 && schedule[schedule.length - 1].type === taskType.systemBreak) {
			schedule.pop()
		}

		logger.log('schedule length in mins: ', totalTaskTime)

		return {
			tasks: schedule,
			totalTaskTime: totalTaskTime
		}
	}

	function getScheduleTimes(date, fromTime, toTime, finishDate = null) {
		logger.log('getScheduleTimes: ', date, fromTime, toTime)
		const sessionFromDate = new Date(date)
		const sessionToDate = finishDate ? new Date(finishDate) : new Date(date)

		if (
			!toTime ||
			(toTime.substring(0, 2) < fromTime.substring(0, 2) && !finishDate)
		) {
			sessionToDate.setDate(sessionToDate.getDate() + 1)
		}

		let start = new Date(
			`${sessionFromDate.toDateString()} ${fromTime}`
		)

		let finish = new Date(
			`${sessionToDate.toDateString()} ${
				toTime ?? fromTime
			}`
		)

		logger.log(start, finish)

		var sessionInMins = Math.floor(
			(finish.getTime() - start.getTime()) / 1000 / 60
		)

		logger.log('session length in mins: ', sessionInMins)

		return {
			start: start,
			finish: finish,
			sessionInMins: sessionInMins
		}
	}

	async function saveAccountToDatabase(account) {
		const db = getDatabase(store.app)
		const accountRef = ref(
			db,
			`account/${store.user.uid}`
		)

		if (account.settings == null) {
			account.settings = store.defaultSettings
		}

		// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
		const plainAccount = JSON.parse(JSON.stringify(account))
		await set(accountRef, plainAccount)
		logger.log('updated account: ', plainAccount)
	}

	async function rescoreActiveBacklog() {
		const db = getDatabase(store.app)

		// Deep clone the entire backlog upfront to avoid iterating reactive Proxy
		// objects that may be mutated by onValue listeners during writes
		const backlog = JSON.parse(JSON.stringify(store.tasks))

		for (const task of backlog) {
			logger.log(`${task.name} current score: ${task.score}`)
			const newScore = scorePriority(task)

			if (task.score != newScore) {
				task.score = newScore
				const listRef = ref(
					db,
					`tasks/${store.user.uid}/${task.id}`
				)
				await set(listRef, task)
				logger.log(`updated ${task.name} score: ${task.score}`)
			}
		}
	}

	function scorePriority(task) {
		const todayDate = new Date()
		const millisecsToDays = 1000 * 60 * 60 * 24
		const priorityScore = task.priority * 10
		const createdDateDiffDays = Math.ceil((todayDate - new Date(task.createdDateTime)) / millisecsToDays)
		const createdDateScore = (createdDateDiffDays / (task.priority + 0.5)) * 0.1

		// Compute effective deadline: for recurring children with deadlineDays,
		// the real deadline is targetDateTime + deadlineDays
		let effectiveDeadline = task.targetDateTime
		if (task.recurrence?.deadlineDays != null && task.targetDateTime) {
			const base = new Date(task.targetDateTime)
			base.setDate(base.getDate() + task.recurrence.deadlineDays)
			effectiveDeadline = base.toISOString()
		}

		if (effectiveDeadline) {
			const deadlineDiffDays = Math.ceil((new Date(effectiveDeadline) - todayDate) / millisecsToDays)
			const deadlineModifier = task.isHardDeadline ? 0.25 : 0.5

			if (deadlineDiffDays > 60) {
				return priorityScore + 30 - createdDateScore
			} else {
				return (deadlineDiffDays * deadlineModifier) + (task.priority * 0.3) - (createdDateDiffDays * 0.0001)
			}
		} else {
			return priorityScore + 30 - createdDateScore
		}
	}

	function calculateNextOccurrence(recurrence, fromDate = new Date()) {
		const from = new Date(fromDate)
		from.setHours(0, 0, 0, 0)

		if (recurrence.type === 'daily') {
			const next = new Date(from)
			next.setDate(next.getDate() + recurrence.interval)
			return next.toISOString()
		}

		if (recurrence.type === 'weekly') {
			// Minimum days ahead: at least 1, with extra weeks for interval > 1
			const minDaysAhead = (recurrence.interval - 1) * 7 + 1
			const candidate = new Date(from)
			candidate.setDate(candidate.getDate() + minDaysAhead)

			for (let i = 0; i < 7; i++) {
				if (recurrence.daysOfWeek.includes(candidate.getDay())) {
					return candidate.toISOString()
				}
				candidate.setDate(candidate.getDate() + 1)
			}

			// Fallback if daysOfWeek is empty or all days scanned
			const fallback = new Date(from)
			fallback.setDate(fallback.getDate() + recurrence.interval * 7)
			return fallback.toISOString()
		}

		if (recurrence.type === 'monthly') {
			const next = new Date(from)
			// Set day to 1 first to avoid month overflow (e.g., Jan 31 + 1 month → Mar 3)
			next.setDate(1)
			next.setMonth(next.getMonth() + recurrence.interval)
			next.setDate(recurrence.dayOfMonth)

			// Handle month overflow (e.g., dayOfMonth=31 in February → last day of Feb)
			if (next.getDate() !== recurrence.dayOfMonth) {
				next.setDate(0)
			}

			return next.toISOString()
		}
	}

	function shouldCreateNextInstance(task) {
		const r = task.recurrence
		if (!r) return false

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		if (r.endDate && today >= new Date(r.endDate)) return false
		if (r.endAfterCount != null && (task.recurrenceCount ?? 0) >= r.endAfterCount) return false

		return true
	}

	function getMissedOccurrences(task) {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const missed = []
		let current = new Date(calculateNextOccurrence(task.recurrence, new Date(task.targetDateTime)))

		while (current <= today) {
			missed.push(current.toISOString())
			current = new Date(calculateNextOccurrence(task.recurrence, current))
		}

		return missed
	}

	function buildRecurringInstance(task, targetDateTime) {
		const newInstance = {
			id: createGuid(),
			createdDateTime: new Date().toJSON(),
			targetDateTime,
			name: task.name,
			priority: task.priority,
			sizing: task.sizing,
			category: task.category,
			isHardDeadline: task.recurrence?.deadlineDays != null
				? (task.recurrence.deadlineIsHard ?? false)
				: false,
			recurrence: task.recurrence,
			recurrenceParentId: task.recurrenceParentId ?? task.id,
			recurrenceCount: (task.recurrenceCount ?? 0) + 1,
			blocked: false,
			blockedReason: null,
			blockedAt: null,
			dependsOn: [],
			completedDateTime: null,
			actualStartTime: null,
			actualDuration: null,
			type: 'userTask'
		}
		newInstance.score = scorePriority(newInstance)
		return newInstance
	}

	function findTaskInSchedule(taskId) {
		const schedule = store.schedule
		if (!schedule?.tasks) return -1
		return schedule.tasks.findIndex(t => t.id === taskId)
	}

	function syncTaskToSchedule(updatedTask) {
		const schedule = store.schedule
		if (!schedule?.tasks) return { inSchedule: false }

		const index = schedule.tasks.findIndex(t => t.id === updatedTask.id)
		if (index === -1) return { inSchedule: false }

		const scheduleCopy = schedule.tasks[index]

		const sizeChanged = scheduleCopy.sizing !== updatedTask.sizing
		const nameChanged = scheduleCopy.name !== updatedTask.name
		const categoryChanged = scheduleCopy.category !== updatedTask.category

		// Check if the updated task's category still matches the schedule's filter
		const categoryMatchesFilter = !schedule.categoriesToInclude ||
			schedule.categoriesToInclude.length === 0 ||
			schedule.categoriesToInclude.includes(updatedTask.category)

		const anyChanged = sizeChanged || nameChanged || categoryChanged

		return {
			inSchedule: true,
			sizeChanged,
			nameChanged,
			categoryChanged,
			categoryMatchesFilter,
			anyChanged
		}
	}

	async function applyScheduleUpdate(updatedTask, shouldRemove = false) {
		const schedule = store.schedule
		if (!schedule?.tasks) return false

		// Deep clone to avoid mutating reactive state directly
		const newSchedule = JSON.parse(JSON.stringify(schedule))
		const index = newSchedule.tasks.findIndex(t => t.id === updatedTask.id)
		if (index === -1) return false

		if (shouldRemove) {
			newSchedule.tasks.splice(index, 1)
		} else {
			// Update task properties while preserving schedule-specific fields
			const existing = newSchedule.tasks[index]
			newSchedule.tasks[index] = {
				...existing,
				name: updatedTask.name,
				sizing: updatedTask.sizing,
				priority: updatedTask.priority,
				category: updatedTask.category,
				targetDateTime: updatedTask.targetDateTime,
				isHardDeadline: updatedTask.isHardDeadline
			}
		}

		await saveScheduleToDatabase(newSchedule)
		store.setSchedule(newSchedule)
		return true
	}

	async function clearTaskDependencies(task) {
		const db = getDatabase(store.app)
		const listRef = ref(db, `tasks/${store.user.uid}/${task.id}`)
		const plainTask = JSON.parse(JSON.stringify(task))
		plainTask.dependsOn = []
		await set(listRef, plainTask)
		logger.log('cleared dependencies:', plainTask)
	}

	async function toggleBlockTask(task, reason = null) {
		const db = getDatabase(store.app)
		const listRef = ref(db, `tasks/${store.user.uid}/${task.id}`)

		const plainTask = JSON.parse(JSON.stringify(task))
		if (plainTask.blocked) {
			plainTask.blocked = false
			plainTask.blockedReason = null
			plainTask.blockedAt = null
		} else {
			plainTask.blocked = true
			plainTask.blockedReason = reason
			plainTask.blockedAt = new Date().toJSON()
		}

		await set(listRef, plainTask)
		logger.log('toggled block:', plainTask)
	}

	async function removeTaskFromSchedule(taskId) {
		const schedule = store.schedule
		if (!schedule?.tasks) return false

		const index = schedule.tasks.findIndex(t => t.id === taskId)
		if (index === -1) return false

		const newSchedule = JSON.parse(JSON.stringify(schedule))
		newSchedule.tasks.splice(index, 1)

		await saveScheduleToDatabase(newSchedule)
		store.setSchedule(newSchedule)
		return true
	}

	return {
		createGuid,
		pageCheck,
		moveTask,
		removeTask,
		saveScheduleToDatabase,
		getScheduleTasks,
		getScheduleTimes,
		saveAccountToDatabase,
		rescoreActiveBacklog,
		scorePriority,
		findTaskInSchedule,
		syncTaskToSchedule,
		applyScheduleUpdate,
		removeTaskFromSchedule,
		toggleBlockTask,
		clearTaskDependencies,
		detectCircularDependency,
		cleanupDependsOn,
		calculateNextOccurrence,
		shouldCreateNextInstance,
		getMissedOccurrences,
		buildRecurringInstance
	}
}

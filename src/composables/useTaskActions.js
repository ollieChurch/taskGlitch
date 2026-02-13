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

		const schedule = []
		let totalTaskTime = 0
		let currentTaskIndex = 0
		let timeSinceLastBreak = 0

		while (
			totalTaskTime < sessionInMins &&
			currentTaskIndex < tasks.length
		) {
			const task = tasks[currentTaskIndex]
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

		if (task.targetDateTime) {
			const deadlineDiffDays = Math.ceil((new Date(task.targetDateTime) - todayDate) / millisecsToDays)
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
		removeTaskFromSchedule
	}
}

import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { getDatabase, ref, set, remove } from 'firebase/database'

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
		console.log('checking page: ', store.user)
		if (!store.user) {
			console.log('no user found')
			router.push('/login')
		}
	}

	async function moveTask(task, list) {
		const db = getDatabase(store.app)

		const listRef = ref(
			db,
			`${list}/${store.user.uid}/${task.id}`
		)

		let removeFromList

		switch (list) {
			case 'completed':
				removeFromList = 'tasks'
				task.completedDateTime = new Date().toJSON()

				if (store.tasks.length === 1) {
					store.setTasks([])
				}
				break
			case 'tasks':
				removeFromList = 'completed'
				task.completedDateTime = null

				if (store.completed.length === 1) {
					store.setCompleted([])
				}
				break
		}

		// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
		const plainTask = JSON.parse(JSON.stringify(task))
		await set(listRef, plainTask)
		removeTask(task, removeFromList)
		console.log('moved task: ', plainTask)
		rescoreActiveBacklog()
	}

	async function removeTask(task, list) {
		const db = getDatabase(store.app)
		const listRef = ref(
			db,
			`${list}/${store.user.uid}/${task.id}`
		)

		await remove(listRef)
		console.log(`removed from ${list}: `, task)
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
		console.log('updated schedule: ', plainSchedule)
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

		console.log('schedule length in mins: ', totalTaskTime)

		return {
			tasks: schedule,
			totalTaskTime: totalTaskTime
		}
	}

	function getScheduleTimes(date, fromTime, toTime, finishDate = null) {
		console.log('getScheduleTimes: ', date, fromTime, toTime)
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

		console.log(start, finish)

		var sessionInMins = Math.floor(
			(finish.getTime() - start.getTime()) / 1000 / 60
		)

		console.log('session length in mins: ', sessionInMins)

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
		console.log('updated account: ', plainAccount)
	}

	function rescoreActiveBacklog() {
		const db = getDatabase(store.app)

		const backlog = store.tasks

		backlog.forEach(async task => {
			console.log(`${task.name} current score: ${task.score}`)
			const listRef = ref(
				db,
				`tasks/${store.user.uid}/${task.id}`
			)

			const newScore = scorePriority(task)

			if (task.score != newScore) {
				task.score = newScore
				// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
				const plainTask = JSON.parse(JSON.stringify(task))
				await set(listRef, plainTask)
				console.log(`updated ${task.name} score: ${task.score}`)
			}
		})
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
		scorePriority
	}
}

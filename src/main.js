import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { getDatabase, ref, set, remove } from 'firebase/database'

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

Vue.mixin({
	methods: {
		createGuid() {
			function S4() {
				return (((1 + Math.random()) * 0x10000) | 0)
					.toString(16)
					.substring(1)
			}
			return (
				S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()
			).toLowerCase()
		},

		pageCheck() {
			console.log('checking page: ', this.$store.state.user)
			if (!this.$store.state.user) {
				console.log('no user found')
				this.$router.push('/login')
			}
		},

		async moveTask(task, list) {
			const db = getDatabase(this.$store.state.app)

			const listRef = ref(
				db,
				`${list}/${this.$store.state.user.uid}/${task.id}`
			)

			let removeFromList

			switch (list) {
				case 'completed':
					removeFromList = 'tasks'
					task.completedDateTime = new Date().toJSON()

					if (this.$store.state.tasks.length === 1) {
						this.$store.commit('setTasks', [])
					}
					break
				case 'tasks':
					removeFromList = 'completed'
					task.completedDateTime = null

					if (this.$store.state.completed.length === 1) {
						this.$store.commit('setCompleted', [])
					}
					break
			}

			await set(listRef, task)
			this.removeTask(task, removeFromList)
			console.log('moved task: ', task)
			this.rescoreActiveBacklog()
		},

		async removeTask(task, list) {
			const db = getDatabase(this.$store.state.app)
			const listRef = ref(
				db,
				`${list}/${this.$store.state.user.uid}/${task.id}`
			)

			await remove(listRef)
			console.log(`removed from ${list}: `, task)
		},

		async saveScheduleToDatabase(schedule) {
			const db = getDatabase(this.$store.state.app)
			const scheduleRef = ref(
				db,
				`schedule/${this.$store.state.user.uid}`
			)

			await set(scheduleRef, schedule)
			console.log('updated schedule: ', schedule)
		},

		getScheduleTasks(tasks, sessionInMins, includeBreaks) {
			const breakFrequency = this.$store.state.account.settings?.breaks?.targetFrequency ?? this.$store.state.defaultSettings.breaks.targetFrequency
			const breakLength = this.$store.state.account.settings?.breaks?.length ?? this.$store.state.defaultSettings.breaks.length
			const taskType = this.$store.state.taskType

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

				console.log()

				if (totalTaskTime + taskLength <= sessionInMins) {
					schedule.push(task)
					totalTaskTime += taskLength
					timeSinceLastBreak += taskLength
				}

				if (includeBreaks && timeSinceLastBreak >= breakFrequency) {
					schedule.push({
						id: this.createGuid(),
						name: 'Take a break',
						sizing: breakLength,
						type: taskType.systemBreak
					})
					totalTaskTime += breakLength
					timeSinceLastBreak = 0
				}

				currentTaskIndex++
			}

			if (schedule[schedule.length - 1].type === taskType.systemBreak) {
				schedule.pop();
			}

			console.log('schedule length in mins: ', totalTaskTime)

			return {
				tasks: schedule,
				totalTaskTime: totalTaskTime
			}
		},

		getScheduleTimes(date, fromTime, toTime, finishDate = null) {
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
		},

		async saveAccountToDatabase(account) {
			const db = getDatabase(this.$store.state.app)
			const accountRef = ref(
				db,
				`account/${this.$store.state.user.uid}`
			)

			if (account.settings == null) {
				account.settings = this.$store.state.defaultSettings
			}

			await set(accountRef, account)
			console.log('updated account: ', account)
		},

		rescoreActiveBacklog() {
			const db = getDatabase(this.$store.state.app)

			const backlog = this.$store.state.tasks

			backlog.forEach(async task => {
				console.log(`${task.name} current score: ${task.score}`)
				const listRef = ref(
					db,
					`tasks/${this.$store.state.user.uid}/${task.id}`
				)

				const newScore = this.scorePriority(task)

				if (task.score != newScore) {
					task.score = newScore
					await set(listRef, task)
					console.log(`updated ${task.name} score: ${task.score}`)
				}
			})
		},

		// scorePriority(task) {
		// 	const todayDate = new Date();
		// 	const millisecsToDays = 1000 * 60 * 60 * 24;
		// 	let score = 0;
		// 	let priorityScore = task.priority * 10;
		// 	let deadlineScore;
		
		// 	const createdDateTime = new Date(task.createdDateTime);
		// 	const createdDateDiffDays = Math.ceil(
		// 		(todayDate - createdDateTime) / millisecsToDays
		// 	);
		// 	const createdDateModifier = task.priority + 0.5;
		// 	const createdDateScore = (createdDateDiffDays / createdDateModifier) * 0.1; // Increase the weight of createdDateScore
		
		// 	if (task.targetDateTime) {
		// 		const deadlineDiffDays = Math.ceil(
		// 			(new Date(task.targetDateTime) - todayDate) / millisecsToDays
		// 		);
		// 		let deadlineModifier = task.isHardDeadline ? 0.25 : 0.5; // Increase the impact of hard deadlines
		
		// 		if (deadlineDiffDays > 60) {
		// 			deadlineScore = priorityScore + 30 - createdDateScore; // Adjust the impact for deadlines more than 30 days away
		// 		} else {
		// 			deadlineScore = (deadlineDiffDays * deadlineModifier) - (createdDateDiffDays * 0.0001); // Increase the impact of the deadline
		// 		}
		// 		score = deadlineScore; // Adjust the final score calculation
		// 	} else {
		// 		score = priorityScore + 30 - createdDateScore;
		// 	}
		
		// 	return score;
		// }

		scorePriority(task) {
			const todayDate = new Date();
			const millisecsToDays = 1000 * 60 * 60 * 24;
			const priorityScore = task.priority * 10;
			const createdDateDiffDays = Math.ceil((todayDate - new Date(task.createdDateTime)) / millisecsToDays);
			const createdDateScore = (createdDateDiffDays / (task.priority + 0.5)) * 0.1;
		
			if (task.targetDateTime) {
				const deadlineDiffDays = Math.ceil((new Date(task.targetDateTime) - todayDate) / millisecsToDays);
				const deadlineModifier = task.isHardDeadline ? 0.25 : 0.5;
		
				if (deadlineDiffDays > 60) {
					return priorityScore + 30 - createdDateScore;
				} else {
					return (deadlineDiffDays * deadlineModifier) + (task.priority * 0.3) - (createdDateDiffDays * 0.0001);
				}
			} else {
				return priorityScore + 30 - createdDateScore;
			}
		}
	}
})

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')

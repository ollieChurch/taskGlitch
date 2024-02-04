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

		moveTask(task, list) {
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

			set(listRef, task).then(() => {
				this.removeTask(task, removeFromList)
				console.log('moved task: ', task)
			})
		},

		removeTask(task, list) {
			const db = getDatabase(this.$store.state.app)
			const listRef = ref(
				db,
				`${list}/${this.$store.state.user.uid}/${task.id}`
			)

			remove(listRef).then(() => {
				console.log(`removed from ${list}: `, task)
			})
		},

		saveScheduleToDatabase(schedule) {
			const db = getDatabase(this.$store.state.app)
			const scheduleRef = ref(
				db,
				`schedule/${this.$store.state.user.uid}`
			)

			set(scheduleRef, schedule).then(() => {
				console.log('updated schedule: ', schedule)
			})
		},

		getScheduleTasks(tasks, sessionInMins, includeBreaks) {
			const breakFrequency = this.$store.state.account.settings?.breaks?.frequency ?? this.$store.state.defaultSettings.breaks.frequency
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

		saveAccountToDatabase(account) {
			const db = getDatabase(this.$store.state.app)
			const accountRef = ref(
				db,
				`account/${this.$store.state.user.uid}`
			)

			if (account.settings == null) {
				account.settings = this.$store.state.defaultSettings
			}

			set(accountRef, account).then(() => {
				console.log('updated account: ', account)
			})
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

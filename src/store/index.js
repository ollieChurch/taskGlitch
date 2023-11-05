import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		completed: [],
		tasks: [],
		taskToPatch: {},
		user: null,
		schedule: {},
		app: {},
		auth: {},
		firebaseConfig: {
			apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
			authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
			databaseURL: process.env.VUE_APP_DATABASE_URL,
			projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
			storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
			appId: process.env.VUE_APP_FIREBASE_APP_ID,
			measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
		},
		settings: {
			priorities: {
				critical: 0,
				high: 1,
				medium: 2,
				low: 3
			},
			
			sizes: {
				short: 15,
				mid: 30,
				long: 60,
				veryLong: 120
			},

			maintainFinishTimeWhenRescheduling: true
		},
		debug: false
	},
	getters: {
		getCategories(state) {
			if (state.tasks) {
				const tasks = Object.values(state.tasks)
				return Array.from(new Set(tasks.map(x => x.category)))
			} else {
				return []
			}
		},

		getPrioritisedTasks(state) {
			if (state.tasks) {
				const tasksArray = state.tasks ?? []
				return Object.values(tasksArray).sort((a, b) => {
					return a.score - b.score
				})
			}
		}
	},
	mutations: {
		setCompleted(state, payload) {
			if (payload) {
				state.completed = Object.values(payload).sort((a, b) => {
					return new Date(b.completedDateTime) - new Date(a.completedDateTime)
				})
			}
		},

		setTasks(state, payload) {
			if (payload) {
				state.tasks = Object.values(payload).sort((a, b) => {
					return new Date(a.targetDateTime) - new Date(b.targetDateTime) || a.priority - b.priority
				})
			}
		},

		setSchedule(state, payload) {
			state.schedule = payload
		},
		
		setScheduleTaskCompleted(state, payload) {
			const newSchedule = state.schedule
			newSchedule.tasks[payload.taskIndex].completed = payload.isTaskCompleted
			state.schedule = newSchedule
		},

		setApp(state, payload) {
			state.app = payload
		},

		setAuth(state, payload) {
			state.auth = payload
		},

		setUser(state, payload) {
			state.user = payload
		},

		setTaskToPatch(state, payload) {
			state.taskToPatch = payload
		}
	},
	actions: {
	},
	modules: {
	}
})

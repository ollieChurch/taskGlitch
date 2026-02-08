import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
	state: () => ({
		appVersion: '0.9.0',
		completed: [],
		tasks: [],
		taskToPatch: {},
		user: null,
		account: {},
		schedule: {},
		updateScheduleStatus: false,
		app: {},
		auth: {},
		firebaseConfig: {
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			databaseURL: import.meta.env.VITE_DATABASE_URL,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
			measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
		},
		priorities: {
			critical: {
				value: 0,
				icon: 'fa-fire',
				color: '#dc3546'
			},
			high: {
				value: 1,
				icon: 'fa-thermometer-three-quarters',
				color: '#ffc107'
			},
			medium: {
				value: 2,
				icon: 'fa-thermometer-half',
				color: '#1a8754'
			},
			low: {
				value: 3,
				icon: 'fa-thermometer-quarter',
				color: '#10caf0'
			}
		},
		taskType: Object.freeze({
			userTask: 'userTask',
			systemBreak: 'systemBreak'
		}),
		defaultSettings: {
			taskLength: {
				short: 15,
				mid: 30,
				long: 60,
				veryLong: 120
			},
			rescheduling: {
				maintainFinishTime: true
			},
			breaks: {
				targetFrequency: 120,
				length: 10
			}
		},
		debug: false
	}),

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
			return []
		},

		getTasksInCreatedOrder(state) {
			if (state.tasks) {
				const tasksArray = state.tasks ?? []
				return Object.values(tasksArray).sort((a, b) => {
					return new Date(a.createdDateTime) - new Date(b.createdDateTime)
				})
			}
			return []
		},

		getUpdateScheduleStatus(state) {
			return state.updateScheduleStatus
		},

		getPriorityNames(state) {
			return Object.keys(state.priorities)
		},

		getAllTasks(state) {
			return [...state.completed, ...state.tasks]
		},

		getAccountSettings(state) {
			return state.account.settings ?? state.defaultSettings
		}
	},

	actions: {
		setCompleted(payload) {
			if (payload) {
				this.completed = Object.values(payload).sort((a, b) => {
					return (
						new Date(b.completedDateTime) -
						new Date(a.completedDateTime)
					)
				})
			}
		},

		setTasks(payload) {
			if (payload) {
				this.tasks = Object.values(payload).sort((a, b) => {
					return (
						new Date(a.targetDateTime) -
							new Date(b.targetDateTime) ||
						a.priority - b.priority
					)
				})
			}
		},

		setSchedule(payload) {
			this.schedule = payload
			this.updateScheduleStatus = true
		},

		setScheduleTaskCompleted(payload) {
			this.schedule.tasks[payload.taskIndex].completed =
				payload.isTaskCompleted
		},

		setApp(payload) {
			this.app = payload
		},

		setAuth(payload) {
			this.auth = payload
		},

		setUser(payload) {
			this.user = payload
		},

		setTaskToPatch(payload) {
			this.taskToPatch = payload
		},

		setUpdateScheduleStatus(payload) {
			this.updateScheduleStatus = payload
		},

		setAccount(payload) {
			this.account = payload
		},

		setAccountSettings(payload) {
			this.account.settings = payload
		}
	}
})

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
	state: () => ({
		appVersion: '0.14.0',
		completed: [],
		tasks: [],
		taskToPatch: {},
		user: null,
		account: {},
		schedule: {},
		updateScheduleStatus: false,
		app: {},
		auth: {},
		// Loading states — true until first Firebase snapshot received
		loading: {
			tasks: true,
			completed: true,
			schedule: true,
			account: true
		},
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
				icon: 'Zap',
				color: '#dc3546'
			},
			high: {
				value: 1,
				icon: 'ArrowUp',
				color: '#ffc107'
			},
			medium: {
				value: 2,
				icon: 'Minus',
				color: '#1a8754'
			},
			low: {
				value: 3,
				icon: 'ArrowDown',
				color: '#a78bfa'
			}
		},
		sizeLabels: {
			15: 'Short',
			30: 'Medium',
			60: 'Long',
			120: 'Very Long'
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
			},
			display: {
				cyberpunkMode: false
			}
		},
		// Deterministic colour palette for category charts
		categoryPalette: [
			'#6366f1', // indigo
			'#f59e0b', // amber
			'#10b981', // emerald
			'#ef4444', // red
			'#8b5cf6', // violet
			'#06b6d4', // cyan
			'#f97316', // orange
			'#ec4899', // pink
			'#14b8a6', // teal
			'#84cc16', // lime
			'#a855f7', // purple
			'#e11d48', // rose
			'#0ea5e9', // sky
			'#d97706', // amber darker
			'#059669', // emerald darker
			'#7c3aed'  // violet darker
		],
		notification: {
			visible: false,
			title: '',
			text: '',
			autoDismissMs: 5000
		},
		pendingScheduleUpdate: null,
		addTaskTrigger: 0,
		debug: false
	}),

	getters: {
		isLoading(state) {
			return state.loading.tasks || state.loading.completed || state.loading.schedule || state.loading.account
		},

		isLoadingTasks(state) {
			return state.loading.tasks
		},

		isLoadingSchedule(state) {
			return state.loading.schedule
		},

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
		},

		getSizeLabel(state) {
			return (sizing) => state.sizeLabels[sizing] ?? `${sizing} mins`
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
		},

		setLoaded(key) {
			this.loading[key] = false
		},

		resetLoading() {
			this.loading = {
				tasks: true,
				completed: true,
				schedule: true,
				account: true
			}
		},

		showNotification(payload) {
			this.notification = {
				visible: true,
				title: payload.title ?? '',
				text: payload.text ?? '',
				autoDismissMs: payload.autoDismissMs ?? 5000
			}
		},

		hideNotification() {
			this.notification.visible = false
		},

		setPendingScheduleUpdate(task) {
			this.pendingScheduleUpdate = task
		},

		clearPendingScheduleUpdate() {
			this.pendingScheduleUpdate = null
		},

		triggerAddTask() {
			this.addTaskTrigger++
		}
	}
})

<template>
	<div id="app" class="flex flex-col min-h-screen md:h-screen md:overflow-hidden">
		<a href="#main-content" class="skip-link">Skip to main content</a>
		<sidebar-nav />
		<notification-banner
			v-if="store.notification.visible"
			:title="store.notification.title"
			:text="store.notification.text"
			:dismissible="true"
			@dismiss="store.hideNotification()"
		/>
		<main id="main-content" class="flex-1 min-h-0 pt-12 pb-16 md:pt-0 md:pb-0 md:overflow-hidden">
			<router-view />
		</main>
		<bottom-dock />
		<patch-notes-modal ref="patchNotesModalRef" :lastVersion="lastVersion" />
		<onboarding-modal ref="onboardingModalRef" />
		<base-modal
			ref="categoryPromptModalRef"
			:hideHeaderClose="true"
			:showDefaultFooter="false"
		>
			<template #header>
				<h5 class="text-lg font-rajdhani font-semibold">Category Mismatch</h5>
			</template>
			<p class="font-rajdhani" v-if="store.pendingScheduleUpdate">
				"{{ store.pendingScheduleUpdate.name }}" has been moved to a category that doesn't match your schedule's filter.
				Would you like to keep it in the schedule or remove it?
			</p>
			<div class="flex gap-3 mt-4">
				<button
					class="btn-themed flex-1 bg-app-success text-text-inverse py-2 px-4 font-bold font-rajdhani hover:brightness-110 transition-all"
					@click="handleKeepInSchedule()"
				>
					Keep in Schedule
				</button>
				<button
					class="btn-themed flex-1 bg-app-danger text-white py-2 px-4 font-bold font-rajdhani hover:brightness-110 transition-all"
					@click="handleRemoveFromSchedule()"
				>
					Remove from Schedule
				</button>
			</div>
		</base-modal>
	</div>
</template>

<script>
import { markRaw } from 'vue'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { useCyberpunkMode } from '@/composables/useCyberpunkMode'
import { logger } from '@/utils/logger'
import SidebarNav from './components/SidebarNav.vue'
import BottomDock from './components/BottomDock.vue'

import PatchNotesModal from './components/PatchNotesModal.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import NotificationBanner from './components/NotificationBanner.vue'
import BaseModal from './components/ui/BaseModal.vue'

export default {
	components: {
		SidebarNav,
		BottomDock,
		PatchNotesModal,
		OnboardingModal,
		NotificationBanner,
		BaseModal
	},

	setup() {
		const store = useAppStore()
		const { saveAccountToDatabase, applyScheduleUpdate, removeTaskFromSchedule } = useTaskActions()
		useCyberpunkMode()
		return { store, saveAccountToDatabase, applyScheduleUpdate, removeTaskFromSchedule }
	},

	data() {
		return {
			lastVersion: null,
			notificationTimer: null,
			onboardingShown: false
		}
	},

	watch: {
		'store.notification.visible'(visible) {
			if (this.notificationTimer) {
				clearTimeout(this.notificationTimer)
				this.notificationTimer = null
			}
			if (visible && this.store.notification.autoDismissMs > 0) {
				this.notificationTimer = setTimeout(() => {
					this.store.hideNotification()
				}, this.store.notification.autoDismissMs)
			}
		},

		'store.pendingScheduleUpdate'(task) {
			if (task) {
				this.$nextTick(() => {
					if (this.$refs.categoryPromptModalRef) {
						this.$refs.categoryPromptModalRef.show()
					}
				})
			}
		},

		'store.patchNotesTrigger'() {
			this.$nextTick(() => {
				if (this.$refs.patchNotesModalRef) {
					this.$refs.patchNotesModalRef.show('changelog')
				}
			})
		},

		'store.onboardingTrigger'() {
			this.$nextTick(() => {
				if (this.$refs.onboardingModalRef) {
					this.$refs.onboardingModalRef.show()
				}
			})
		}
	},

	async created() {
		// markRaw prevents Pinia from wrapping Firebase internals in reactive Proxies,
		// which would corrupt Firebase's internal SortedMap data structures
		const app = markRaw(initializeApp(this.store.firebaseConfig))
		const auth = markRaw(getAuth(app))
		this.store.setApp(app)
		this.store.setAuth(auth)

		onAuthStateChanged(auth, user => {
			logger.log('auth state changed')
			if (
				user &&
				(!this.store.user ||
					user.uid != this.store.user.uid)
			) {
				logger.log('updating user')
				this.store.resetLoading()
				this.store.setUser(markRaw(user))
				this.linkToDatabase()
				this.redirectToFirstPage()
			} else if (!user) {
				this.store.setCompleted([])
				this.store.setTasks([])
				this.store.setAccount({})
				this.store.setUser(null)
				this.store.resetLoading()
				logger.log('user should be logged out')
				this.redirectToFirstPage()
			}
		})
	},

	methods: {
		linkToDatabase() {
			const db = getDatabase(this.store.app)
			const completedRef = ref(
				db,
				`completed/${this.store.user.uid}`
			)
			const tasksRef = ref(db, `tasks/${this.store.user.uid}`)
			const scheduleRef = ref(
				db,
				`schedule/${this.store.user.uid}`
			)
			const accountRef = ref(
				db,
				`account/${this.store.user.uid}`
			)

			onValue(accountRef, snapshot => {
				const currentAccount = snapshot.val()
				this.store.setAccount(currentAccount)
				this.store.setLoaded('account')

				const currentAppVersion = this.store.appVersion
				if (currentAppVersion == currentAccount?.lastLoginVersion) {
					return
				}

				this.lastVersion = currentAccount?.lastLoginVersion

				this.$nextTick(() => {
					if (this.$refs.patchNotesModalRef) {
						this.$refs.patchNotesModalRef.show()
					}
				})

				const newAccount = {
					...currentAccount,
					lastLoginVersion: currentAppVersion
				}

				this.saveAccountToDatabase(newAccount)
			})

			onValue(completedRef, snapshot => {
				this.store.setCompleted(snapshot.val())
				this.store.setLoaded('completed')
			})

			onValue(tasksRef, snapshot => {
				this.store.setTasks(snapshot.val())
				this.store.setLoaded('tasks')
			})

			onValue(scheduleRef, snapshot => {
				this.store.setSchedule(snapshot.val())
				this.store.setLoaded('schedule')
			})
		},

		redirectToFirstPage() {
			const newPath = this.$route.fullPath.replace('/login', '/user')
			this.$route.query.mode
				? this.$router.push(newPath)
				: this.$router.push('/')
		},

		async handleKeepInSchedule() {
			const task = this.store.pendingScheduleUpdate
			if (task) {
				await this.applyScheduleUpdate(task, false)
				this.store.showNotification({
					title: 'Schedule Updated',
					text: `"${task.name}" has been kept in your schedule.`
				})
			}
			this.store.clearPendingScheduleUpdate()
			this.$refs.categoryPromptModalRef.close()
		},

		async handleRemoveFromSchedule() {
			const task = this.store.pendingScheduleUpdate
			if (task) {
				await this.removeTaskFromSchedule(task.id)
				this.store.showNotification({
					title: 'Schedule Updated',
					text: `"${task.name}" has been removed from your schedule.`
				})
			}
			this.store.clearPendingScheduleUpdate()
			this.$refs.categoryPromptModalRef.close()
		}
	}
}
</script>

<style>
#app {
	font-family: 'Rajdhani', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: var(--color-text-primary);
	background: var(--color-surface-base);
	position: relative;
	user-select: none;
	overflow-x: hidden;
}

/* Desktop: flex height chain through main → transition → view */
@media (min-width: 768px) {
	main {
		display: flex;
		flex-direction: column;
	}
	main > :deep(*) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
}

</style>

<template>
	<div id="app" class="flex flex-col min-h-screen">
		<header-nav />
		<main class="flex-1">
			<router-view></router-view>
		</main>
		<page-footer />
		<patch-notes-modal ref="patchNotesModalRef" v-if="lastVersion" :lastVersion="lastVersion" />
	</div>
</template>

<script>
import { markRaw } from 'vue'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import PageFooter from './components/PageFooter.vue'
import HeaderNav from './components/HeaderNav.vue'
import PatchNotesModal from './components/PatchNotesModal.vue'

export default {
	components: {
		PageFooter,
		HeaderNav,
		PatchNotesModal
	},

	setup() {
		const store = useAppStore()
		const { saveAccountToDatabase } = useTaskActions()
		return { store, saveAccountToDatabase }
	},

	data() {
		return {
			lastVersion: null
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
			console.log('auth state changed')
			if (
				user &&
				(!this.store.user ||
					user.uid != this.store.user.uid)
			) {
				console.log('updating user')
				this.store.setUser(markRaw(user))
				this.linkToDatabase()
				this.redirectToFirstPage()
			} else if (!user) {
				this.store.setCompleted([])
				this.store.setTasks([])
				this.store.setAccount({})
				this.store.setUser(null)
				console.log('user should be logged out')
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
				console.log('account snapshot', currentAccount)
				this.store.setAccount(currentAccount)

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
				console.log('completed snapshot', snapshot.val())
				this.store.setCompleted(snapshot.val())
			})

			onValue(tasksRef, snapshot => {
				console.log('tasks snapshot', snapshot.val())
				this.store.setTasks(snapshot.val())
			})

			onValue(scheduleRef, snapshot => {
				console.log('schedule snapshot', snapshot.val())
				this.store.setSchedule(snapshot.val())
			})
		},

		redirectToFirstPage() {
			const newPath = this.$route.fullPath.replace('/login', '/user')
			this.$route.query.mode
				? this.$router.push(newPath)
				: this.$router.push('/')
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
	color: #2c3e50;
	background: #d5e7eb;
	min-width: 100vw;
	min-height: 100vh;
	position: relative;
	user-select: none;
}

nav a {
	font-weight: bold;
	color: #2c3e50;
}

nav a.router-link-exact-active {
	color: #42b983;
}
</style>

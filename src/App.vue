<template>
	<div id="app" class="d-flex flex-column justify-content-sm-between">
		<header-nav />
		<router-view></router-view>
		<page-footer />
	</div>
</template>

<script>
	import { initializeApp } from 'firebase/app'
	import { getAuth, onAuthStateChanged } from 'firebase/auth'
	import { getDatabase, ref, onValue } from 'firebase/database'
	import PageFooter from './components/PageFooter.vue'
	import HeaderNav from './components/HeaderNav.vue'

	export default {
		components: {
			PageFooter,
			HeaderNav
		},

		async created() {
			const app = initializeApp(this.$store.state.firebaseConfig)
			const auth = getAuth(app)
			this.$store.commit('setApp', app)
			this.$store.commit('setAuth', auth)

			onAuthStateChanged(auth, user => {
				console.log('auth state changed')
				if (
					user &&
					(!this.$store.state.user ||
						user.uid != this.$store.state.user.uid)
				) {
					console.log('updating user')
					this.$store.commit('setUser', user)
					this.linkToDatabase()
					if (this.$route.query.mode) {
						const newPath = this.$route.fullPath.replace('/login', '/user')
						this.$router.push(newPath)
					} else {
						this.$router.push('/')
					}
				} else if (!user) {
					this.$store.commit('setCompleted', [])
					this.$store.commit('setTasks', [])
					this.$store.commit('setAccount', {})
					this.$store.commit('setUser', null)
					console.log('user should be logged out')
				}
			})
		},

		methods: {
			linkToDatabase() {
				const db = getDatabase(this.$store.state.app)
				const completedRef = ref(
					db,
					`completed/${this.$store.state.user.uid}`
				)
				const tasksRef = ref(db, `tasks/${this.$store.state.user.uid}`)
				const scheduleRef = ref(
					db,
					`schedule/${this.$store.state.user.uid}`
				)
				const accountRef = ref(
					db,
					`account/${this.$store.state.user.uid}`
				)

				onValue(accountRef, snapshot => {
					const currentAccount = snapshot.val()
					console.log('account snapshot', currentAccount)
					this.$store.commit('setAccount', currentAccount)

					const currentAppVersion = this.$store.state.appVersion
					if (currentAppVersion == currentAccount?.lastLoginVersion) {
						return
					}

					// TODO: logic here for triggering patch notes to user

					const newAccount = {
						...currentAccount,
						lastLoginVersion: currentAppVersion
					}

					this.saveAccountToDatabase(newAccount)
				})

				onValue(completedRef, snapshot => {
					console.log('completed snapshot', snapshot.val())
					this.$store.commit('setCompleted', snapshot.val())
				})

				onValue(tasksRef, snapshot => {
					console.log('tasks snapshot', snapshot.val())
					this.$store.commit('setTasks', snapshot.val())
				})

				onValue(scheduleRef, snapshot => {
					console.log('schedule snapshot', snapshot.val())
					this.$store.commit('setSchedule', snapshot.val())
				})
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

	.glitchFont {
		font-family: 'Wallpoet', cursive;
		font-style: italic;
	}

	nav {
		padding: 30px;
		background: white;
	}

	nav a {
		font-weight: bold;
		color: #2c3e50;
	}

	nav a.router-link-exact-active {
		color: #42b983;
	}

	.form-input {
		margin-bottom: 1em;
	}

	.debug {
		outline: 2px solid red;
	}

	.schedule-sidebar-toggle {
		position: absolute;
		bottom: 0;
		left: 0;
		max-width: 300px;
	}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

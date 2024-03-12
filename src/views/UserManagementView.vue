<template>
	<content-card v-if="displayMessage">
		<i
			:class="`fas fa-lg mb-5 ${
				taskComplete
					? 'fa-check-circle text-success'
					: 'fa-times-circle text-danger'
			}`"
			style="font-size: 4rem"
		></i>
		<h1>{{ title }}</h1>
		<b-card-title class="mb-5">
			{{ text }}
		</b-card-title>
		<b-btn
			@click="() => $router.push('/')"
			:variant="taskComplete ? 'primary' : 'warning'"
			size="lg"
			class="font-weight-bold"
		>
			Back To Glitch
		</b-btn>
	</content-card>
</template>

<script>
	import ContentCard from '@/components/ContentCard.vue'
	import { applyActionCode } from 'firebase/auth'

	export default {
		name: 'UserManagementView',

		components: { ContentCard },

		data() {
			return {
				title: null,
				text: null,
				taskComplete: false
			}
		},

		computed: {
			auth() {
				return this.$store.state.auth
			},

			displayMessage() {
				return this.title && this.text
			}
		},

		mounted() {
			this.handleUserManagement()
		},

		methods: {
			handleUserManagement() {
				const mode = this.$route.query.mode
				const actionCode = this.$route.query.oobCode

				switch (mode) {
					case 'resetPassword':
						this.handleResetPassword(actionCode)
						break
					case 'recoverEmail':
						this.handleRecoverEmail(actionCode)
						break
					case 'verifyEmail':
						this.handleVerifyEmail(actionCode)
						break
					default:
						console.error('unrecognised user management mode')
						this.displayError()
				}
			},

			handleResetPassword(actionCode) {
				console.log('handle reset password selected', actionCode)
			},

			handleRecoverEmail(actionCode) {
				console.log('handle recover email', actionCode)
			},

			async handleVerifyEmail(actionCode) {
				if (!this.auth.currentUser?.emailVerified) {
					try {
						await applyActionCode(this.auth, actionCode)

						const userToUpdate = { ...this.$store.state.user }
						userToUpdate.emailVerified = true
						this.$store.commit('setUser', userToUpdate)
						this.displayTaskSuccess(
							'Thanks for verifying your email address'
						)
					} catch {
						console.error('email was not verified due to an error')
						this.displayError(
							'Please try verifying your email again later'
						)
					}
				} else if (this.auth.currentUser?.emailVerified) {
					console.log('user email is already verified')
					this.displayTaskSuccess(
						'Thanks for verifying your email address'
					)
				}
			},

			displayError(customMessage = null) {
				this.title = 'Sorry something went wrong!'
				this.text = customMessage || 'Please try again later'
				this.taskComplete = false
			},

			displayTaskSuccess(customMessage = null) {
				this.title = 'All done!'
				this.text = customMessage || "Now let's get some stuff done!"
				this.taskComplete = true
			}
		}
	}
</script>

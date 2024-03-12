<template>
	<content-card>
		<div v-if="changePassword.displayForm">
			<b-row class="align-items-center mb-4">
				<h1 class="mb-1 text-start text-center pt-3">
					Change you password
				</h1>
			</b-row>
			<b-form @submit.prevent="() => confirmResetPassword()">
				<b-row class="align-items-center text-start mt-4">
					<label for="user-newPassword" class="col-sm-3">
						New Password
					</label>
					<b-col class="col-sm-9">
						<b-form-input
							id="user-password"
							v-model="changePassword.newPassword"
							placeholder="password"
							type="password"
							size="lg"
						></b-form-input>
					</b-col>
				</b-row>
				<b-row class="align-items-center text-start mt-4">
					<label for="user-confirmNewPassword" class="col-sm-3">
						Confirm New Password
					</label>
					<b-col class="col-sm-9">
						<b-form-input
							id="user-confirmNewPassword"
							v-model="changePassword.confirmNewPassword"
							placeholder="confirm password"
							type="password"
							size="lg"
						></b-form-input>
					</b-col>
				</b-row>
				<div class="d-flex flex-column mx-auto gap-3 mt-5 w-75">
					<b-btn type="submit" variant="warning" size="lg">
						Change Password
					</b-btn>
				</div>
			</b-form>
		</div>

		<div v-if="displayMessage">
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
		</div>
	</content-card>
</template>

<script>
	import ContentCard from '@/components/ContentCard.vue'
	import {
		applyActionCode,
		verifyPasswordResetCode,
		confirmPasswordReset
	} from 'firebase/auth'

	export default {
		name: 'UserManagementView',

		components: { ContentCard },

		data() {
			return {
				title: null,
				text: null,
				taskComplete: false,
				savedActionCode: null,
				changePassword: {
					displayForm: false,
					newPassword: '',
					confirmNewPassword: ''
				}
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
						this.handleResetPasswordRequest(actionCode)
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

			async handleResetPasswordRequest(actionCode) {
				try {
					await verifyPasswordResetCode(this.auth, actionCode)
					this.savedActionCode = actionCode
					this.changePassword.displayForm = true
				} catch (e) {
					console.error(`the action code could not be verified ${e}`)
					this.displayError(
						'Oops! That link does not look right. Please try again.'
					)
				}
			},

			async confirmResetPassword() {
				if (
					this.changePassword.newPassword ==
					this.changePassword.confirmNewPassword
				) {
					try {
						await confirmPasswordReset(
							this.auth,
							this.savedActionCode,
							this.changePassword.newPassword
						)
						this.displayTaskSuccess(
							'Your password has been successfully changed'
						)
					} catch (e) {
						console.error(`the password could not be updated. ${e}`)
						this.displayError(
							'Your password could not be changed. Please try again later.'
						)
					}
				} else {
					// TODO: Add validation to form fields
					window.alert('Please ensure your new password and confirmation are the same.')
				}
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
				this.changePassword.displayForm = false

				this.title = 'Sorry something went wrong!'
				this.text = customMessage || 'Please try again later'
				this.taskComplete = false
			},

			displayTaskSuccess(customMessage = null) {
				this.changePassword.displayForm = false

				this.title = 'All done!'
				this.text = customMessage || "Now let's get some stuff done!"
				this.taskComplete = true
			}
		}
	}
</script>

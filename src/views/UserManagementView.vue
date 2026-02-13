<template>
	<content-card>
		<div v-if="changePassword.displayForm">
			<div class="items-center mb-4">
				<h1 class="mb-1 text-center pt-3 font-rajdhani font-bold text-2xl">
					Change you password
				</h1>
			</div>
			<form @submit.prevent="() => confirmResetPassword()">
				<div class="flex flex-wrap items-center text-start mt-4">
					<label for="user-newPassword" class="w-full sm:w-3/12 font-rajdhani font-semibold">
						New Password
					</label>
					<div class="w-full sm:w-9/12">
						<input
							id="user-password"
							v-model="changePassword.newPassword"
							placeholder="password"
							type="password"
							class="w-full border rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				<div class="flex flex-wrap items-center text-start mt-4">
					<label for="user-confirmNewPassword" class="w-full sm:w-3/12 font-rajdhani font-semibold">
						Confirm New Password
					</label>
					<div class="w-full sm:w-9/12">
						<input
							id="user-confirmNewPassword"
							v-model="changePassword.confirmNewPassword"
							placeholder="confirm password"
							type="password"
							class="w-full border rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				<div class="flex flex-col mx-auto gap-3 mt-5 w-3/4">
					<button
						type="submit"
						class="bg-yellow-400 text-black py-2 px-4 rounded text-lg font-rajdhani font-semibold hover:bg-yellow-500"
					>
						Change Password
					</button>
				</div>
			</form>
		</div>

		<div v-if="displayMessage" class="text-center py-8">
			<i
				:class="`fas fa-lg mb-5 ${
					taskComplete
						? 'fa-check-circle text-green-600'
						: 'fa-times-circle text-red-600'
				}`"
				style="font-size: 4rem"
			></i>
			<h1 class="font-rajdhani font-bold text-2xl">{{ title }}</h1>
			<h5 class="mb-5 font-rajdhani font-semibold">
				{{ text }}
			</h5>
			<button
				@click="() => $router.push('/')"
				:class="`py-2 px-6 rounded text-lg font-bold font-rajdhani ${
					taskComplete
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'bg-yellow-400 text-black hover:bg-yellow-500'
				}`"
			>
				Back To Glitch
			</button>
		</div>
	</content-card>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { logger } from '@/utils/logger'
import ContentCard from '@/components/ContentCard.vue'
import {
	applyActionCode,
	verifyPasswordResetCode,
	confirmPasswordReset
} from 'firebase/auth'

export default {
	name: 'UserManagementView',

	components: { ContentCard },

	setup() {
		const store = useAppStore()
		return { store }
	},

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
			return this.store.auth
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
					logger.error('unrecognised user management mode')
					this.displayError()
			}
		},

		async handleResetPasswordRequest(actionCode) {
			try {
				await verifyPasswordResetCode(this.auth, actionCode)
				this.savedActionCode = actionCode
				this.changePassword.displayForm = true
			} catch (e) {
				logger.error(`the action code could not be verified ${e}`)
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
					logger.error(`the password could not be updated. ${e}`)
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
			logger.log('handle recover email', actionCode)
		},

		async handleVerifyEmail(actionCode) {
			if (!this.auth.currentUser?.emailVerified) {
				try {
					await applyActionCode(this.auth, actionCode)

					const userToUpdate = { ...this.store.user }
					userToUpdate.emailVerified = true
					this.store.setUser(userToUpdate)
					this.displayTaskSuccess(
						'Thanks for verifying your email address'
					)
				} catch {
					logger.error('email was not verified due to an error')
					this.displayError(
						'Please try verifying your email again later'
					)
				}
			} else if (this.auth.currentUser?.emailVerified) {
				logger.log('user email is already verified')
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

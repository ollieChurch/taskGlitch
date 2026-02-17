<template>
	<content-card>
		<div v-if="userForgotPassword">
			<div class="items-center mb-4">
				<h1 class="mb-1 text-center pt-3 font-rajdhani font-bold text-2xl text-text-heading">
					Forgotten your password?
				</h1>
				<p class="mb-0 text-center sm:text-left font-rajdhani text-text-primary">
					Let us know your email and if your are already registered
					with Task Glitch we will drop you a message.
				</p>
			</div>
			<form @submit.prevent="() => forgotPassword()">
				<div class="flex flex-wrap items-center text-start mt-4">
					<label for="forgotten-password-email" class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary">
						Email
					</label>
					<div class="w-full sm:w-9/12">
						<input
							id="forgotten-password-email"
							v-model="email"
							placeholder="email"
							type="email"
							class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
						/>
					</div>
				</div>
				<div class="flex flex-col mx-auto gap-3 mt-5 w-3/4">
					<button
						type="submit"
						class="btn-themed bg-app-warning text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
					>
						Send Request
					</button>
					<button
						type="button"
						class="btn-themed bg-accent text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
						@click="setUserForgotPassword()"
					>
						Back
					</button>
				</div>
			</form>
		</div>
		<div v-else>
			<div class="items-center mb-4">
				<div class="flex flex-wrap items-center">
					<div class="w-full order-1 sm:order-2 sm:w-9/12">
						<h1
							class="mb-1 text-center sm:text-left pt-3 font-rajdhani font-bold text-2xl text-text-heading"
						>
							Welcome to Task Glitch
						</h1>
						<p class="mb-0 text-center sm:text-left font-rajdhani text-text-primary">
							Intelligent task scheduling that prioritises your backlog
							and generates optimised work sessions. Add tasks, set
							deadlines, and let the algorithm do the rest.
						</p>
					</div>
					<div
						class="w-full px-5 py-3 sm:py-0 sm:px-0 order-first sm:order-3 sm:w-3/12 flex justify-center"
					>
						<glitch-emblem :size="100" />
					</div>
				</div>
			</div>

			<BaseTabs pills fill>
				<BaseTab title="Login">
					<form @submit.prevent="() => login()">
						<div class="flex flex-wrap items-center text-start mt-4">
							<label for="login-email" class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary">
								Email
							</label>
							<div class="w-full sm:w-9/12">
								<input
									id="login-email"
									v-model="email"
									placeholder="email"
									type="email"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
						</div>
						<div class="flex flex-wrap items-center text-start mt-4">
							<label for="login-password" class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary">
								Password
							</label>
							<div class="w-full sm:w-9/12">
								<input
									id="login-password"
									v-model="password"
									placeholder="password"
									type="password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
						</div>
						<div class="flex flex-col mx-auto gap-3 mt-5 w-3/4">
							<button
								type="submit"
								class="btn-themed bg-accent text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
									>
								Login
							</button>
							<button
								type="button"
								class="btn-themed bg-app-warning text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
										@click="setUserForgotPassword()"
							>
								Forgot Your Password?
							</button>
						</div>
					</form>
				</BaseTab>
				<BaseTab title="Sign Up">
					<form @submit.prevent="() => register()">
						<div class="flex flex-wrap items-center text-start mt-4">
							<label for="register-email" class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary">
								Email
							</label>
							<div class="w-full sm:w-9/12">
								<input
									id="register-email"
									v-model="email"
									placeholder="email"
									type="email"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
						</div>
						<div class="flex flex-wrap items-center text-start mt-4">
							<label for="register-password" class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary">
								Password
							</label>
							<div class="w-full sm:w-9/12">
								<input
									id="register-password"
									v-model="password"
									placeholder="password"
									type="password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
						</div>
						<div class="flex flex-wrap items-center text-start mt-4">
							<label
								for="register-confirmPassword"
								class="w-full sm:w-3/12 font-rajdhani font-semibold text-text-secondary"
							>
								Confirm Password
							</label>
							<div class="w-full sm:w-9/12">
								<input
									id="register-confirmPassword"
									v-model="confirmPassword"
									placeholder="confirm password"
									type="password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
						</div>
						<div class="flex flex-col mx-auto gap-3 mt-5 w-3/4">
							<button
								type="submit"
								class="btn-themed bg-accent text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
									>
								Register
							</button>
						</div>
					</form>
				</BaseTab>
			</BaseTabs>
		</div>
	</content-card>
</template>

<script>
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendEmailVerification,
	sendPasswordResetEmail
} from 'firebase/auth'
import { useAppStore } from '@/stores/app'
import { logger } from '@/utils/logger'
import ContentCard from '@/components/ContentCard.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'
import GlitchEmblem from '@/components/GlitchEmblem.vue'

export default {
	name: 'LoginView',

	components: {
		ContentCard,
		BaseTabs,
		BaseTab,
		GlitchEmblem
	},

	setup() {
		const store = useAppStore()
		return { store }
	},

	data() {
		return {
			email: '',
			password: '',
			confirmPassword: '',
			userForgotPassword: false
		}
	},

	computed: {
		auth() {
			return this.store.auth
		},

		passwordConfirmed() {
			return this.password
				? this.password === this.confirmPassword
				: null
		},

		validEmail() {
			if (this.email) {
				const re = /\S+@\S+\.\S+/
				return re.test(this.email)
			} else {
				return null
			}
		}
	},

	methods: {
		async register() {
			if (this.passwordConfirmed && this.validEmail) {
				try {
					const response = await createUserWithEmailAndPassword(
						this.auth,
						this.email,
						this.password
					)
					await sendEmailVerification(response.user)
					logger.log('sent email verification')
				} catch (ex) {
					logger.error(ex)
					window.alert('something went wrong')
					// TODO: Better unhappy path handling of register
				}
			} else {
				const message = this.validEmail
					? 'password does not match'
					: 'enter a valid email'
				window.alert(message)
			}
		},

		async login() {
			try {
				await signInWithEmailAndPassword(
					this.auth,
					this.email,
					this.password
				)
			} catch {
				window.alert(
					'The credentials entered do not match to an account. Please try again.'
				)
				// TODO: Better unhappy path handling of login
			}
		},

		async forgotPassword() {
			try {
				await sendPasswordResetEmail(this.auth, this.email)

				// TODO: Replace this with a nicer custom alert to the user
				window.alert('We sent you an email. Please check your inbox.')

				this.setUserForgotPassword()
			} catch {
				window.alert('We had a problem sending you an email. Please try again later.')
				// TODO: Better unhappy path handling of forgotten password
			}
		},

		setUserForgotPassword() {
			this.userForgotPassword = !this.userForgotPassword
			window.scrollTo(0, 0)
		}
	}
}
</script>

<template>
	<!-- Scrollable landing page for logged-out visitors -->
	<div class="min-h-full overflow-y-auto">

		<!-- Hero section -->
		<section class="py-10 px-4 text-center border-b border-border-visible">
			<div class="flex justify-center mb-4">
				<glitch-emblem :size="72" />
			</div>
			<h1 class="font-wallpoet text-3xl sm:text-4xl text-accent mb-3">
				Task Glitch
			</h1>
			<p class="font-rajdhani text-xl text-text-primary max-w-md mx-auto mb-3">
				Stop juggling. Start shipping.
			</p>
			<p class="font-rajdhani text-text-secondary max-w-sm mx-auto mb-0">
				Intelligent task scheduling that scores your backlog and builds you
				an optimised work session — automatically.
			</p>
		</section>

		<!-- How it works -->
		<section class="py-8 px-4 border-b border-border-visible">
			<h2 class="font-rajdhani font-bold text-sm text-text-secondary uppercase tracking-widest text-center mb-6">
				How it works
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
				<div class="depth-panel p-4 text-left">
					<p class="font-wallpoet text-accent text-sm mb-1">01</p>
					<h3 class="font-rajdhani font-bold text-text-heading mb-1">Add your tasks</h3>
					<p class="font-rajdhani text-sm text-text-secondary mb-0">
						Drop tasks into your backlog with a priority, size estimate, and optional deadline.
					</p>
				</div>
				<div class="depth-panel p-4 text-left">
					<p class="font-wallpoet text-accent text-sm mb-1">02</p>
					<h3 class="font-rajdhani font-bold text-text-heading mb-1">Auto-prioritise</h3>
					<p class="font-rajdhani text-sm text-text-secondary mb-0">
						The scoring algorithm ranks everything by urgency, age, and deadline proximity.
					</p>
				</div>
				<div class="depth-panel p-4 text-left">
					<p class="font-wallpoet text-accent text-sm mb-1">03</p>
					<h3 class="font-rajdhani font-bold text-text-heading mb-1">Glitch It!</h3>
					<p class="font-rajdhani text-sm text-text-secondary mb-0">
						Generate a focused work session with your highest-priority tasks and built-in breaks.
					</p>
				</div>
				<div class="depth-panel p-4 text-left">
					<p class="font-wallpoet text-accent text-sm mb-1">04</p>
					<h3 class="font-rajdhani font-bold text-text-heading mb-1">Track progress</h3>
					<p class="font-rajdhani text-sm text-text-secondary mb-0">
						Complete tasks, watch your dashboard stats grow, and see how accurate your estimates are.
					</p>
				</div>
			</div>
		</section>

		<!-- Login / Register -->
		<section class="py-8 px-4">
			<div v-if="userForgotPassword" class="max-w-sm mx-auto depth-panel p-6">
				<h2 class="mb-1 text-center font-rajdhani font-bold text-2xl text-text-heading">
					Reset your password
				</h2>
				<p class="mb-4 text-center font-rajdhani text-text-secondary text-sm">
					Enter your email and we'll send you a reset link if your account exists.
				</p>
				<form @submit.prevent="() => forgotPassword()">
					<div class="mb-4">
						<label for="forgotten-password-email" class="block font-rajdhani font-semibold text-text-secondary mb-1">
							Email
						</label>
						<input
							id="forgotten-password-email"
							v-model="email"
							placeholder="you@example.com"
							type="email"
							autocomplete="email"
							class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
						/>
					</div>
					<div class="flex flex-col gap-3">
						<button
							type="submit"
							class="btn-themed bg-app-warning text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
						>
							Send Reset Link
						</button>
						<button
							type="button"
							class="btn-themed bg-accent text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
							@click="setUserForgotPassword()"
						>
							Back to Login
						</button>
					</div>
				</form>
			</div>

			<div v-else class="max-w-sm mx-auto depth-panel p-6">
				<h2 class="mb-4 text-center font-rajdhani font-bold text-xl text-text-heading">
					Get started free
				</h2>

				<BaseTabs pills fill>
					<BaseTab title="Login">
						<form @submit.prevent="() => login()">
							<div class="mb-3">
								<label for="login-email" class="block font-rajdhani font-semibold text-text-secondary mb-1">
									Email
								</label>
								<input
									id="login-email"
									v-model="email"
									placeholder="you@example.com"
									type="email"
									autocomplete="email"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
							<div class="mb-4">
								<label for="login-password" class="block font-rajdhani font-semibold text-text-secondary mb-1">
									Password
								</label>
								<input
									id="login-password"
									v-model="password"
									placeholder="password"
									type="password"
									autocomplete="current-password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
							<div class="flex flex-col gap-3">
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
									Forgot Password?
								</button>
							</div>
						</form>
					</BaseTab>
					<BaseTab title="Sign Up">
						<form @submit.prevent="() => register()">
							<div class="mb-3">
								<label for="register-email" class="block font-rajdhani font-semibold text-text-secondary mb-1">
									Email
								</label>
								<input
									id="register-email"
									v-model="email"
									placeholder="you@example.com"
									type="email"
									autocomplete="email"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
							<div class="mb-3">
								<label for="register-password" class="block font-rajdhani font-semibold text-text-secondary mb-1">
									Password
								</label>
								<input
									id="register-password"
									v-model="password"
									placeholder="password"
									type="password"
									autocomplete="new-password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
							<div class="mb-4">
								<label
									for="register-confirmPassword"
									class="block font-rajdhani font-semibold text-text-secondary mb-1"
								>
									Confirm Password
								</label>
								<input
									id="register-confirmPassword"
									v-model="confirmPassword"
									placeholder="confirm password"
									type="password"
									autocomplete="new-password"
									class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 text-lg font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
							</div>
							<div class="flex flex-col gap-3">
								<button
									type="submit"
									class="btn-themed bg-accent text-text-inverse py-2 px-4 text-lg font-rajdhani font-semibold hover:brightness-110 transition-all"
								>
									Create Account
								</button>
							</div>
						</form>
					</BaseTab>
				</BaseTabs>
			</div>
		</section>

	</div>
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
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'
import GlitchEmblem from '@/components/GlitchEmblem.vue'

export default {
	name: 'LoginView',

	components: {
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

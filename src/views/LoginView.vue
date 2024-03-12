<template>
	<content-card>
		<div v-if="userForgotPassword">
			<b-row class="align-items-center mb-4">
				<h1 class="mb-1 text-start text-center pt-3">
					Forgotten your password?
				</h1>
				<p class="mb-0 text-sm-start">
					Let us know your email and if your are already registered
					with Task Glitch we will drop you a message.
				</p>
			</b-row>
			<b-form @submit.prevent="() => forgotPassword()">
				<b-row class="align-items-center text-start mt-4">
					<label for="forgotten-password-email" class="col-sm-3">
						Email
					</label>
					<b-col class="col-sm-9">
						<b-form-input
							id="forgotten-password-email"
							v-model="email"
							placeholder="email"
							type="email"
							size="lg"
						></b-form-input>
					</b-col>
				</b-row>
				<div class="d-flex flex-column mx-auto gap-3 mt-5 w-75">
					<b-btn type="submit" variant="warning" size="lg">
						Send Request
					</b-btn>
					<b-btn
						variant="info"
						size="lg"
						@click="setUserForgotPassword()"
					>
						Back
					</b-btn>
				</div>
			</b-form>
		</div>
		<div v-else>
			<b-row class="align-items-center mb-4">
				<h1
					class="mb-0 text-start order-2 order-sm-1 text-sm-start text-center pt-3"
				>
					Say hi to Glitch...
				</h1>
				<b-col class="col-12 order-3 order-sm-2 col-sm-9">
					<p class="mb-0 text-sm-start">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Nullam a tortor sed enim rutrum molestie in at metus.
						Proin ac accumsan ipsum, ac pellentesque odio. Aliquam
						mattis erat tellus.
					</p>
				</b-col>
				<b-col
					class="col-12 px-5 py-3 py-sm-0 px-sm-0 order-1 order-sm-3 col-sm-3"
				>
					<b-img :src="glitchImg" fluid alt="a cartoon robot"></b-img>
				</b-col>
			</b-row>

			<b-tabs pills fill>
				<b-tab title="Login">
					<b-form @submit.prevent="() => login()">
						<b-row class="align-items-center text-start mt-4">
							<label for="login-email" class="col-sm-3">
								Email
							</label>
							<b-col class="col-sm-9">
								<b-form-input
									id="login-email"
									v-model="email"
									placeholder="email"
									type="email"
									size="lg"
								></b-form-input>
							</b-col>
						</b-row>
						<b-row class="align-items-center text-start mt-4">
							<label for="login-password" class="col-sm-3">
								Password
							</label>
							<b-col class="col-sm-9">
								<b-form-input
									id="login-password"
									v-model="password"
									placeholder="password"
									type="password"
									size="lg"
								></b-form-input>
							</b-col>
						</b-row>
						<div class="d-flex flex-column mx-auto gap-3 mt-5 w-75">
							<b-btn type="submit" variant="success" size="lg">
								Login
							</b-btn>
							<b-btn
								variant="warning"
								size="lg"
								@click="setUserForgotPassword()"
							>
								Forgot Your Password?
							</b-btn>
						</div>
					</b-form>
				</b-tab>
				<b-tab title="Sign Up">
					<b-form @submit.prevent="() => register()">
						<b-row class="align-items-center text-start mt-4">
							<label for="register-email" class="col-sm-3">
								Email
							</label>
							<b-col class="col-sm-9">
								<b-form-input
									id="register-email"
									v-model="email"
									placeholder="email"
									type="email"
									size="lg"
								></b-form-input>
							</b-col>
						</b-row>
						<b-row class="align-items-center text-start mt-4">
							<label for="register-password" class="col-sm-3">
								Password
							</label>
							<b-col class="col-sm-9">
								<b-form-input
									id="register-password"
									v-model="password"
									placeholder="password"
									type="password"
									size="lg"
								></b-form-input>
							</b-col>
						</b-row>
						<b-row class="align-items-center text-start mt-4">
							<label
								for="register-confirmPassword"
								class="col-sm-3"
							>
								Confirm Password
							</label>
							<b-col class="col-sm-9">
								<b-form-input
									id="register-confirmPassword"
									v-model="confirmPassword"
									placeholder="confirm password"
									type="password"
									size="lg"
								></b-form-input>
							</b-col>
						</b-row>
						<div class="d-flex flex-column mx-auto gap-3 mt-5 w-75">
							<b-btn type="submit" variant="info" size="lg">
								Register
							</b-btn>
						</div>
					</b-form>
				</b-tab>
			</b-tabs>
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
	import ContentCard from '@/components/ContentCard.vue'
	import glitch from '@/assets/glitch.png'

	export default {
		name: 'LoginView',

		components: {
			ContentCard
		},

		data() {
			return {
				email: '',
				password: '',
				confirmPassword: '',
				glitchImg: glitch,
				userForgotPassword: false
			}
		},

		computed: {
			auth() {
				return this.$store.state.auth
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
						console.log('sent email verification')
					} catch (ex) {
						console.error(ex)
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

<style scoped>
	img {
		max-width: 100%;
		max-height: 100%;
	}
</style>

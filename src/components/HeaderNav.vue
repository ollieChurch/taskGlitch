<template>
	<div>
		<b-navbar toggleable="lg" class="px-3 py-3">
			<b-navbar-brand href="/" class="glitchFont">
				Task Glitch
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav class="ms-auto pt-4 pt-lg-0">
					<router-link
						v-if="!user"
						to="/login"
						class="px-3 pb-0 mb-0 h4 text-decoration-none"
					>
						Login
					</router-link>
					<template v-else>
						<router-link
							to="/dashboard"
							class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none"
						>
							Dashboard
						</router-link>
						<router-link
							to="/"
							class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none"
						>
							Tasks
						</router-link>
						<router-link
							to="/schedule"
							class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none"
						>
							Glitch
						</router-link>
						<router-link
							to="/profile"
							class="pb-0 mb-0 h4 text-decoration-none"
						>
							Profile
						</router-link>
					</template>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<notification-banner
			v-if="displayEmailVerificationBanner"
			title="Is that really you?"
			:text="emailVerifyBannerText"
			:callToActionText="verifyEmailSent ? null : 'Resend email'"
			@callToActionClicked="resendVerifyEmail()"
		/>
	</div>
</template>

<script>
	import { sendEmailVerification } from 'firebase/auth'
	import NotificationBanner from './NotificationBanner.vue'

	export default {
		components: { NotificationBanner },

		data() {
			return {
				verifyEmailSent: false
			}
		},

		computed: {
			user() {
				return this.$store.state.user
			},

			emailVerifyBannerText() {
				let text =
					'Please verify your email address, you should already have an email from us'
				if (!this.verifyEmailSent)
					text = `${text} or you can resend it using the link`
				return text
			},

			displayEmailVerificationBanner() {
				if (this.user && this.user.metadata) {
					const daysSinceCreated = Math.floor(
						(new Date() -
							Date.parse(this.user.metadata.creationTime)) /
							86400000
					)
					return (
						!this.user.emailVerified &&
						daysSinceCreated > 0 &&
						this.$route.path !== '/user'
					)
				} else {
					return false
				}
			}
		},

		methods: {
			async resendVerifyEmail() {
				console.log('resend verify email')
				await sendEmailVerification(this.user)
				this.verifyEmailSent = true
			}
		}
	}
</script>

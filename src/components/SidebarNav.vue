<template>
	<div>
		<!-- Top bar: logo only -->
		<div class="top-bar fixed top-0 left-0 right-0 z-40 flex items-center justify-center px-4 py-3 bg-surface-raised border-b border-border-visible md:static">
			<a href="/" class="font-wallpoet italic text-lg no-underline text-accent">
				Task Glitch
			</a>
		</div>

		<!-- Email verification banner -->
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
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import { logger } from '@/utils/logger'
import NotificationBanner from './NotificationBanner.vue'

export default {
	components: { NotificationBanner },

	setup() {
		const store = useAppStore()
		const route = useRoute()
		return { store, route }
	},

	data() {
		return {
			verifyEmailSent: false
		}
	},

	computed: {
		user() {
			return this.store.user
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
					this.route.path !== '/user'
				)
			} else {
				return false
			}
		}
	},

	methods: {
		async resendVerifyEmail() {
			logger.log('resend verify email')
			await sendEmailVerification(this.user)
			this.verifyEmailSent = true
		}
	}
}
</script>

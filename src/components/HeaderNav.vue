<template>
	<div>
		<nav class="flex items-center justify-between flex-wrap px-3 py-3 bg-surface-raised border-b-2 border-accent-dim">
			<a href="/" class="font-wallpoet italic text-xl no-underline text-accent">
				Task Glitch
			</a>

			<button
				@click="navOpen = !navOpen"
				class="lg:hidden p-2 text-text-secondary hover:text-accent transition-colors"
			>
				<Menu :size="20" />
			</button>

			<div
				:class="['w-full lg:flex lg:items-center lg:w-auto', navOpen ? 'bg-surface-overlay lg:bg-transparent' : 'hidden']"
				class="pt-4 lg:pt-0"
			>
				<div class="lg:ml-auto flex flex-col lg:flex-row">
					<router-link
						v-if="!user"
						to="/login"
						class="px-3 pb-0 mb-0 text-xl font-semibold no-underline text-text-secondary hover:text-accent transition-colors font-rajdhani"
					>
						Login
					</router-link>
					<template v-else>
						<router-link
							to="/dashboard"
							class="lg:pr-4 pb-0 mb-0 text-xl font-semibold no-underline text-text-secondary hover:text-accent transition-colors font-rajdhani"
						>
							Dashboard
						</router-link>
						<router-link
							to="/"
							class="lg:pr-4 pb-0 mb-0 text-xl font-semibold no-underline text-text-secondary hover:text-accent transition-colors font-rajdhani"
						>
							Tasks
						</router-link>
						<router-link
							to="/schedule"
							class="lg:pr-4 pb-0 mb-0 text-xl font-semibold no-underline text-text-secondary hover:text-accent transition-colors font-rajdhani"
						>
							Glitch
						</router-link>
						<router-link
							to="/profile"
							class="pb-0 mb-0 text-xl font-semibold no-underline text-text-secondary hover:text-accent transition-colors font-rajdhani"
						>
							Profile
						</router-link>
					</template>
				</div>
			</div>
		</nav>
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
import { Menu } from 'lucide-vue-next'

export default {
	components: { NotificationBanner, Menu },

	setup() {
		const store = useAppStore()
		const route = useRoute()
		return { store, route }
	},

	data() {
		return {
			verifyEmailSent: false,
			navOpen: false
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

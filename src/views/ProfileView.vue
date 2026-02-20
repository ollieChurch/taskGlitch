<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
	<content-card class="text-left">
		<div class="flex items-center justify-between mb-3 shrink-0">
			<h1 class="text-left mb-0 font-rajdhani font-bold text-2xl text-text-heading">Profile</h1>
			<button
				@click="logout()"
				class="btn-themed bg-app-warning text-text-inverse px-4 py-2 font-rajdhani font-semibold hover:brightness-110 transition-all"
				>
				Logout
			</button>
		</div>
		<hr class="border-border-default shrink-0" />

		<div class="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
		<!-- 2-column grid on desktop: Account+Display | Scheduling -->
		<div class="lg:grid lg:grid-cols-2 lg:gap-x-10">
			<!-- Left column: Account + Display -->
			<div class="max-w-md">
				<!-- Account -->
				<div v-if="user?.email" class="mt-3">
					<div class="flex items-center justify-between mb-3">
						<h3 class="mb-0 font-rajdhani font-bold text-xl text-text-heading">Account</h3>
					</div>
					<div class="flex">
						<div class="w-6/12 sm:w-5/12">
							<p class="font-rajdhani text-text-secondary">Email</p>
						</div>
						<div>
							<p class="font-rajdhani text-text-primary">{{ user.email }}</p>
						</div>
					</div>
				</div>
				<hr class="border-border-default" />

				<!-- Display -->
				<div class="mt-3">
					<div class="flex items-center justify-between mb-3">
						<h3 class="mb-0 font-rajdhani font-bold text-xl text-text-heading">Display</h3>
					</div>
					<div class="flex items-center justify-between mb-4 pl-4">
						<div>
							<p class="font-rajdhani text-text-primary mb-0">Cyberpunk Mode</p>
							<p class="font-rajdhani text-text-secondary text-sm mb-0">Neon glow, scan lines &amp; glitch effects</p>
						</div>
						<button
							@click="toggleCyberpunkMode()"
							:class="[
								'relative w-12 h-6 rounded-full transition-colors duration-200',
								isCyberpunkOn ? 'bg-accent' : 'bg-surface-hover'
							]"
						>
							<span
								:class="[
									'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200',
									isCyberpunkOn ? 'translate-x-6' : ''
								]"
							></span>
						</button>
					</div>
				</div>
				<hr class="border-border-default lg:hidden" />
			</div>

			<!-- Right column: Glitch Scheduling -->
			<div class="max-w-md">
				<div class="mt-3">
					<div class="flex items-center justify-between mb-3">
						<h3 class="mb-0 font-rajdhani font-bold text-xl text-text-heading">Glitch Scheduling</h3>
						<a class="text-text-secondary hover:text-accent cursor-pointer transition-colors" @click="editSettings()">
							<Pencil :size="18" />
						</a>
					</div>
					<div
						v-for="(settingsGroup, index) in Object.keys(
							getAccountSettings
						)"
						:key="`${settingsGroup}-settingDisplay-${index}`"
					>
						<h5 class="font-rajdhani font-semibold text-text-primary" v-if="settingsGroup !== 'display'">{{ settingsGroup }}</h5>
						<div class="mb-4" v-if="settingsGroup !== 'display'">
							<div
								v-for="setting in Object.keys(
									getAccountSettings[settingsGroup]
								)"
								:key="`${setting}-${settingsGroup}-settingDisplay`"
								class="flex"
							>
								<div class="w-6/12 sm:w-5/12 pl-4">
									<p class="font-rajdhani text-text-secondary">{{ setting }}</p>
								</div>
								<div>
									<p class="font-rajdhani text-text-primary">
										{{
											createSettingString(
												getAccountSettings[settingsGroup][
													setting
												]
											)
										}}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div><!-- /2-column grid -->

		<hr class="border-border-default" />

		<!-- Danger Zone — full width -->
		<div class="max-w-lg">
			<h3 class="mb-4 mt-3 font-rajdhani font-bold text-xl text-app-danger">Danger Zone</h3>
			<div class="flex justify-between items-center">
				<h5 class="text-app-danger font-rajdhani font-semibold">
					Restore Default Settings
				</h5>
				<button
					class="btn-themed bg-app-danger text-white px-4 py-2 font-bold font-rajdhani hover:brightness-110 transition-all"
						@click="restoreDefaultSettings()"
				>
					Restore
				</button>
			</div>
		</div>

		<hr class="border-border-default mt-4" />
		<div class="flex flex-wrap items-center justify-center gap-4 mt-4 mb-2">
			<button
				class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
				@click="store.triggerOnboarding()"
			>
				How it works
			</button>
			<button
				class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
				@click="store.triggerPatchNotes()"
			>
				What's new
			</button>
			<a
				href="mailto:feedback@taskglitch.app"
				class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
			>
				Feedback
			</a>
		</div>
		<p class="text-center text-xs text-text-secondary font-rajdhani mb-0 opacity-60">
			v{{ store.appVersion }}
		</p>

		<settings-modal ref="settingsModalRef" :accountSettings="getAccountSettings" />
		</div><!-- /scroll-panel -->
	</content-card>
	</div>
</template>

<script>
import { signOut } from 'firebase/auth'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import { Pencil } from 'lucide-vue-next'

export default {
	name: 'ProfileView',

	components: {
		ContentCard,
		SettingsModal,
		Pencil
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, saveAccountToDatabase } = useTaskActions()
		return { store, pageCheck, saveAccountToDatabase }
	},

	created() {
		this.pageCheck()
	},

	computed: {
		getAccountSettings() {
			return this.store.getAccountSettings
		},

		user() {
			return this.store.user
		},

		isCyberpunkOn() {
			return this.store.account?.settings?.display?.cyberpunkMode ?? false
		}
	},

	methods: {
		logout() {
			signOut(this.store.auth)
		},

		restoreDefaultSettings() {
			this.store.setAccountSettings(this.store.defaultSettings)
			this.saveAccountToDatabase(this.store.account)
		},

		createSettingString(settingValue) {
			return typeof settingValue == 'number'
				? `${settingValue} mins`
				: settingValue
		},

		editSettings() {
			this.$refs.settingsModalRef.show()
		},

		toggleCyberpunkMode() {
			const currentSettings = this.store.account?.settings ?? { ...this.store.defaultSettings }
			const displaySettings = currentSettings.display ?? {}
			const newSettings = {
				...currentSettings,
				display: {
					...displaySettings,
					cyberpunkMode: !displaySettings.cyberpunkMode
				}
			}
			this.store.setAccountSettings(newSettings)
			this.saveAccountToDatabase(this.store.account)
		}
	}
}
</script>

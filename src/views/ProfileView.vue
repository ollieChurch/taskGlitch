<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
	<content-card class="text-left">
		<div class="flex items-center justify-between mt-2 mb-4 shrink-0">
			<h1 class="text-left mb-0 font-rajdhani font-bold text-2xl text-text-heading">Profile</h1>
			<button
				@click="logout()"
				class="btn-themed flex items-center gap-1.5 bg-surface-hover border border-border-visible text-text-secondary px-4 py-2 text-sm font-rajdhani font-semibold hover:border-app-danger hover:text-app-danger transition-all"
			>
				<LogOut :size="14" />
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
					<div class="flex pl-4">
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
				<hr class="border-border-default" />

				<!-- Data Management -->
				<div class="mt-3">
					<div class="flex items-center justify-between mb-3">
						<h3 class="mb-0 font-rajdhani font-bold text-xl text-text-heading">Data Management</h3>
					</div>
					<div class="flex items-center justify-between mb-4 pl-4">
						<div>
							<p class="font-rajdhani text-text-primary mb-0">Completed task retention</p>
							<p class="font-rajdhani text-text-secondary text-sm mb-0">Tasks older than this are archived on login</p>
						</div>
						<div class="flex items-center gap-2">
							<input
								v-model.number="retentionDays"
								type="number"
								min="1"
								max="180"
								class="border border-border-default bg-surface-base text-text-primary rounded px-3 py-1 w-20 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
							/>
							<span class="font-rajdhani text-text-secondary text-sm">days</span>
						</div>
					</div>
					<div class="flex justify-end pl-4 mb-2" v-if="retentionDays !== savedRetentionDays">
						<button
							@click="saveRetentionDays()"
							class="btn-themed bg-accent text-text-inverse px-4 py-1.5 font-rajdhani font-semibold text-sm hover:brightness-110 transition-all"
						>
							Save
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
						v-for="(settingsGroup, index) in visibleSettingGroups"
						:key="`${settingsGroup}-settingDisplay-${index}`"
					>
						<h5 class="font-rajdhani font-semibold text-text-primary">{{ settingGroupLabel(settingsGroup) }}</h5>
						<div class="mb-4">
							<div
								v-for="setting in Object.keys(
									getAccountSettings[settingsGroup]
								)"
								:key="`${setting}-${settingsGroup}-settingDisplay`"
								class="flex"
							>
								<div class="w-6/12 sm:w-5/12 pl-4">
									<p class="font-rajdhani text-text-secondary">{{ settingLabel(settingsGroup, setting) }}</p>
								</div>
								<div>
									<p class="font-rajdhani text-text-primary">
										{{
											createSettingString(
												getAccountSettings[settingsGroup][setting]
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

		<!-- Help & Info -->
		<div class="flex flex-wrap items-center justify-center gap-3 my-4">
			<button
				class="btn-themed flex items-center gap-1.5 bg-surface-hover border border-border-visible text-text-secondary px-3 py-1.5 text-sm font-rajdhani font-semibold hover:border-accent-dim hover:text-text-primary transition-all"
				@click="store.triggerOnboarding()"
			>
				<HelpCircle :size="14" />
				How it works
			</button>
			<button
				class="btn-themed flex items-center gap-1.5 bg-surface-hover border border-border-visible text-text-secondary px-3 py-1.5 text-sm font-rajdhani font-semibold hover:border-accent-dim hover:text-text-primary transition-all"
				@click="store.triggerPatchNotes()"
			>
				<Sparkles :size="14" />
				What's new
			</button>
		</div>

		<hr class="border-border-default" />

		<!-- Danger Zone -->
		<div class="mt-3 mb-2 border border-app-danger/30 rounded-lg p-4">
			<h3 class="mb-3 font-rajdhani font-bold text-sm uppercase tracking-widest text-app-danger">Danger Zone</h3>
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="font-rajdhani font-semibold text-text-primary mb-0">Restore Default Settings</p>
					<p class="font-rajdhani text-text-secondary text-sm mb-0">Reset all scheduling preferences to their defaults</p>
				</div>
				<button
					class="btn-themed flex items-center gap-1.5 shrink-0 border border-app-danger/50 text-app-danger bg-transparent px-4 py-2 text-sm font-semibold font-rajdhani hover:bg-app-danger hover:text-white transition-all"
					@click="restoreDefaultSettings()"
				>
					<RotateCcw :size="14" />
					Restore
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-secondary font-rajdhani mb-0 mt-4 opacity-60">
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
import { Pencil, LogOut, HelpCircle, Sparkles, RotateCcw } from 'lucide-vue-next'
import { settingLabels } from '@/assets/settingLabels'

export default {
	name: 'ProfileView',

	components: {
		ContentCard,
		SettingsModal,
		Pencil,
		LogOut,
		HelpCircle,
		Sparkles,
		RotateCcw
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, saveAccountToDatabase } = useTaskActions()
		return { store, pageCheck, saveAccountToDatabase }
	},

	data() {
		return {
			retentionDays: 90
		}
	},

	created() {
		this.pageCheck()
		this.retentionDays = this.savedRetentionDays
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
		},

		savedRetentionDays() {
			return this.store.getAccountSettings?.dataManagement?.completedRetentionDays ?? 90
		},

		visibleSettingGroups() {
			return Object.keys(this.getAccountSettings).filter(
				g => g !== 'display' && g !== 'dataManagement'
			)
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

		settingGroupLabel(group) {
			return settingLabels._groups[group] ?? group
		},

		settingLabel(group, setting) {
			return settingLabels[group]?.[setting] ?? setting
		},

		createSettingString(settingValue) {
			return typeof settingValue == 'number'
				? `${settingValue} mins`
				: settingValue
		},

		editSettings() {
			this.$refs.settingsModalRef.show()
		},

		saveRetentionDays() {
			if (this.retentionDays < 1 || this.retentionDays > 180) {
				this.store.showNotification({
					title: 'Invalid retention period',
					text: 'Retention must be between 1 and 180 days'
				})
				return
			}
			const currentSettings = this.store.account?.settings ?? { ...this.store.defaultSettings }
			const dataManagement = currentSettings.dataManagement ?? {}
			const newSettings = {
				...currentSettings,
				dataManagement: {
					...dataManagement,
					completedRetentionDays: this.retentionDays
				}
			}
			this.store.setAccountSettings(newSettings)
			this.saveAccountToDatabase(this.store.account)
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

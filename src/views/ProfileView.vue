<template>
	<content-card class="text-left">
		<div class="flex items-center justify-between mb-3">
			<h1 class="text-left mb-0 font-rajdhani font-bold text-2xl">Profile</h1>
			<button
				@click="logout()"
				class="bg-yellow-400 text-black px-4 py-2 rounded font-rajdhani font-semibold hover:bg-yellow-500"
			>
				Logout
			</button>
		</div>
		<hr />
		<div v-if="user?.email" class="mt-3">
			<div class="flex items-center justify-between mb-3">
				<h3 class="mb-0 font-rajdhani font-bold text-xl">Account</h3>
			</div>

			<div class="flex">
				<div class="w-6/12 sm:w-5/12">
					<p class="font-rajdhani">Email</p>
				</div>
				<div>
					<p class="font-rajdhani">{{ user.email }}</p>
				</div>
			</div>
		</div>
		<hr />
		<div class="mt-3">
			<div class="flex items-center justify-between mb-3">
				<h3 class="mb-0 font-rajdhani font-bold text-xl">Glitch Scheduling</h3>
				<a class="text-start cursor-pointer" @click="editSettings()">
					<i class="fas fa-edit"></i>
				</a>
			</div>
			<div
				v-for="(settingsGroup, index) in Object.keys(
					getAccountSettings
				)"
				:key="`${settingsGroup}-settingDisplay-${index}`"
			>
				<h5 class="font-rajdhani font-semibold">{{ settingsGroup }}</h5>
				<div class="mb-4">
					<div
						v-for="setting in Object.keys(
							getAccountSettings[settingsGroup]
						)"
						:key="`${setting}-${settingsGroup}-settingDisplay`"
						class="flex"
					>
						<div class="w-6/12 sm:w-5/12 pl-4">
							<p class="font-rajdhani">{{ setting }}</p>
						</div>
						<div>
							<p class="font-rajdhani">
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
		<hr />
		<h3 class="mb-4 mt-3 font-rajdhani font-bold text-xl">Danger Zone</h3>
		<div class="flex justify-between items-center">
			<h5 class="text-red-600 font-rajdhani font-semibold">
				Restore Default Settings
			</h5>
			<button
				class="bg-red-600 text-white px-4 py-2 rounded font-bold font-rajdhani hover:bg-red-700"
				@click="restoreDefaultSettings()"
			>
				Restore
			</button>
		</div>

		<settings-modal ref="settingsModalRef" :accountSettings="getAccountSettings" />
	</content-card>
</template>

<script>
import { signOut } from 'firebase/auth'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import SettingsModal from '@/components/SettingsModal.vue'

export default {
	name: 'ProfileView',

	components: {
		ContentCard,
		SettingsModal
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
		}
	}
}
</script>

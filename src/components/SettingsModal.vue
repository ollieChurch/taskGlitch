<template>
	<BaseModal
		ref="modalRef"
		title="Customise your Glitch"
		@ok="handleOk"
		@hide="handleClose"
		@show="setUpData"
	>
		<form ref="settingsForm">
			<div
				v-for="(settingsGroup, index) in Object.keys(settings)"
				:key="`settingsModal-${settingsGroup}-${index}`"
			>
				<h5 class="mb-4 font-rajdhani font-semibold text-text-heading">{{ settingsGroup }}</h5>
				<div
					v-for="(setting, settingIndex) in Object.keys(settings[settingsGroup])"
					:key="`settingsModal-${settingsGroup}-${setting}-${settingIndex}`"
					class="flex justify-between gap-4 items-center mb-3"
				>
					<div>
						<p class="mb-0 font-rajdhani text-text-primary">{{ setting }}</p>
						<small class="text-text-secondary">{{
							typeof accountSettings[settingsGroup][setting] == 'number'
								? 'time in minutes'
								: ''
						}}</small>
					</div>
					<label
						v-if="typeof accountSettings[settingsGroup][setting] == 'boolean'"
						class="relative inline-flex items-center cursor-pointer"
					>
						<input
							type="checkbox"
							:id="setting"
							v-model="settings[settingsGroup][setting]"
							class="sr-only peer"
						/>
						<div class="w-11 h-6 bg-surface-hover rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-text-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
					</label>
					<input
						v-else
						:id="setting"
						v-model="settings[settingsGroup][setting]"
						required
						:type="typeof accountSettings[settingsGroup][setting] == 'number' ? 'number' : 'text'"
						class="border border-border-default bg-surface-base text-text-primary rounded px-3 py-1 w-24 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					/>
				</div>
				<hr v-if="index !== Object.keys(settings).length - 1" class="my-4 border-border-default" />
			</div>
		</form>
	</BaseModal>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import BaseModal from './ui/BaseModal.vue'

export default {
	name: 'SettingsModal',
	components: { BaseModal },
	props: ['accountSettings'],

	setup() {
		const store = useAppStore()
		const { saveAccountToDatabase } = useTaskActions()
		return { store, saveAccountToDatabase }
	},

	data() {
		return {
			settings: {},
			valid: {}
		}
	},

	mounted() {
		this.setUpData()
	},

	methods: {
		show() {
			this.$refs.modalRef.show()
		},
		setUpData() {
			Object.keys(this.accountSettings).forEach(settingsGroup => {
				let newValidGroup = {}
				let newDataGroup = {}
				Object.keys(this.accountSettings[settingsGroup]).forEach(
					setting => {
						newValidGroup = {
							...newValidGroup,
							[setting]: null
						}
						newDataGroup = {
							...newDataGroup,
							[setting]: this.accountSettings[settingsGroup][setting]
						}
					}
				)

				this.valid = {
					...this.valid,
					[settingsGroup]: newValidGroup
				}
				this.settings = {
					...this.settings,
					[settingsGroup]: newDataGroup
				}
			})
		},

		handleOk() {
			this.store.setAccountSettings(this.settings)
			this.saveAccountToDatabase(this.store.account)
			this.$refs.modalRef.close()
		},

		handleClose() {
			this.settings = {}
		}
	},
	expose: ['show']
}
</script>

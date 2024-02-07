<template>
	<b-modal
		id="settingsModal"
		@ok="handleOk"
		@hide="handleClose"
		@show="setUpData"
		title="Customise your Glitch"
	>
		<b-form ref="settingsForm">
			<div
				v-for="(settingsGroup, index) in Object.keys(settings)"
				:key="`settingsModal-${settingsGroup}-${index}`"
			>
				<b-card-title class="mb-4">{{ settingsGroup }}</b-card-title>
				<b-form-group
					v-for="(setting, settingIndex) in Object.keys(
						settings[settingsGroup]
					)"
					:key="`settingsModal-${settingsGroup}-${setting}-${settingIndex}`"
					invalid-feedback="this is invalid input"
					:state="valid[settingsGroup][setting]"
					class="form-input d-flex justify-content-between gap-4 align-items-center"
				>
					<template #label>
						<b-card-text class="mb-0">{{ setting }}</b-card-text>
						<small class="text-muted">{{
							typeof accountSettings[settingsGroup][setting] ==
							'number'
								? 'time in minutes'
								: ''
						}}</small>
					</template>
					<b-form-checkbox
						v-if="
							typeof accountSettings[settingsGroup][setting] ==
							'boolean'
						"
						:id="setting"
						v-model="settings[settingsGroup][setting]"
						:state="valid[settingsGroup][setting]"
						switch
						size="lg"
					></b-form-checkbox>
					<b-form-input
						v-else
						:id="setting"
						v-model="settings[settingsGroup][setting]"
						:state="valid[settingsGroup][setting]"
						required
						:number="typeof accountSettings[settingsGroup][setting] == 'number'"
						:type="typeof accountSettings[settingsGroup][setting] == 'number' ? 'number' : 'text'"
					></b-form-input>
				</b-form-group>
				<hr v-if="index !== Object.keys(settings).length - 1" />
			</div>
		</b-form>
	</b-modal>
</template>

<script>
	export default {
		name: 'SettingsModal',

		props: ['accountSettings'],

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
								[setting]:
									this.accountSettings[settingsGroup][setting]
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

			handleOk(bvModalEvent) {
				bvModalEvent.preventDefault()
				this.$store.commit('setAccountSettings', this.settings)
				this.saveAccountToDatabase(this.$store.state.account)

				this.$nextTick(() => {
					this.$bvModal.hide('settingsModal')
				})
			},

			handleClose() {
				this.settings = {}
			}
		}
	}
</script>

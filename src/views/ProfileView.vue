<template>
	<content-card class="text-left">
		<div class="d-flex align-items-center justify-content-between mb-3">
			<h1 class="text-left mb-0">Profile</h1>
			<b-btn @click="logout()" variant="warning">Logout</b-btn>
		</div>
		<hr />
		<div v-if="user?.email">
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="mb-0">Account</h3>
				<b-link class="text-start">
					<!-- <i class="fas fa-edit"></i> -->
				</b-link>
			</div>

			<b-row>
				<b-col class="col-6 col-sm-5">
					<b-card-text>Email</b-card-text>
				</b-col>
				<b-col>
					<b-card-text>{{ user.email }}</b-card-text>
				</b-col>
			</b-row>
		</div>
		<hr />
		<div>
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="mb-0">Glitch Scheduling</h3>
				<b-link class="text-start" @click="editSettings()">
					<i class="fas fa-edit"></i>
				</b-link>
			</div>
			<div
				v-for="(settingsGroup, index) in Object.keys(
					getAccountSettings
				)"
				:key="`${settingsGroup}-settingDisplay-${index}`"
			>
				<b-card-title>{{ settingsGroup }}</b-card-title>
				<div class="mb-4">
					<b-row
						v-for="setting in Object.keys(
							getAccountSettings[settingsGroup]
						)"
						:key="`${setting}-${settingsGroup}-settingDisplay`"
					>
						<b-col class="col-6 col-sm-5 ps-4">
							<b-card-text>{{ setting }}</b-card-text>
						</b-col>
						<b-col>
							<b-card-text>
								{{
									createSettingString(
										getAccountSettings[settingsGroup][
											setting
										]
									)
								}}
							</b-card-text>
						</b-col>
					</b-row>
				</div>
			</div>
		</div>
		<hr />
		<h3 class="mb-4">Danger Zone</h3>
		<div class="d-flex justify-content-between align-items-center">
			<b-card-title class="text-danger">
				Restore Default Settings
			</b-card-title>
			<b-btn
				variant="danger"
				class="font-weight-bold"
				@click="restoreDefaultSettings()"
			>
				Restore
			</b-btn>
		</div>

		<settings-modal :accountSettings="getAccountSettings" />
	</content-card>
</template>

<script>
	import { signOut } from 'firebase/auth'
	import ContentCard from '@/components/ContentCard.vue'
	import SettingsModal from '@/components/SettingsModal.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'ProfileView',

		components: {
			ContentCard,
			SettingsModal
		},

		created() {
			this.pageCheck()
		},

		computed: {
			...mapGetters(['getAccountSettings']),

			user() {
				return this.$store.state.user
			}
		},

		methods: {
			logout() {
				signOut(this.$store.state.auth)
			},

			restoreDefaultSettings() {
				this.$store.commit(
					'setAccountSettings',
					this.$store.state.defaultSettings
				)
				this.saveAccountToDatabase(this.$store.state.account)
			},

			createSettingString(settingValue) {
				return typeof settingValue == 'number'
					? `${settingValue} mins`
					: settingValue
			},

			editSettings() {
				this.$bvModal.show('settingsModal')
			}
		}
	}
</script>

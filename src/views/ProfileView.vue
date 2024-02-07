<template>
	<content-card class="text-left">
		<h1>Profile</h1>
		<hr />
		<div v-if="user?.email">
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="mb-0">Account</h3>
				<b-link class="text-start">
					<i class="fas fa-edit"></i>
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

			<b-row>
				<b-col class="col-6 col-sm-5">
					<b-card-text>Password</b-card-text>
				</b-col>
				<b-col>
					<b-card-text><em>edit account to change</em></b-card-text>
				</b-col>
			</b-row>
		</div>
		<hr />
		<div>
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="mb-0">Glitch Scheduling</h3>
				<b-link class="text-start">
					<i class="fas fa-edit"></i>
				</b-link>
			</div>
			<div
				v-for="(settingsGroup, index) in Object.keys(settings)"
				:key="`${settingsGroup}-settingDisplay-${index}`"
			>
				<b-card-title>{{ settingsGroup }}</b-card-title>
				<div class="mb-4">
					<b-row v-for="setting in Object.keys(settings[settingsGroup])" :key="`${setting}-${settingsGroup}-settingDisplay`">
						<b-col class="col-6 col-sm-5 ps-4">
							<b-card-text>{{ setting }}</b-card-text>
						</b-col>
						<b-col>
							<b-card-text>
								{{ createSettingString(settings[settingsGroup][setting]) }}
							</b-card-text>
						</b-col>
					</b-row>
				</div>
			</div>
		</div>
		<hr />
		<h3 class="mb-4">Danger Zone</h3>
		<div class="d-flex justify-content-between align-items-center">
			<b-card-title class="text-danger"
				>Restore Default Settings</b-card-title
			>
			<b-btn
				variant="danger"
				class="font-weight-bold"
				@click="restoreDefaultSettings()"
			>
				Restore
			</b-btn>
		</div>
	</content-card>
</template>

<script>
	import ContentCard from '@/components/ContentCard.vue'
	import { mapGetters } from 'vuex'

	export default {
		name: 'ProfileView',

		components: {
			ContentCard
		},

		data() {
			return {
				isEditMode: {
					account: false,
					scheduling: false
				},
				settings: {}
			}
		},

		created() {
			this.pageCheck()
			this.settings = this.getAccountSettings
		},

		computed: {
			...mapGetters(['getAccountSettings']),

			user() {
				return this.$store.state.user
			}
		},

		methods: {
			restoreDefaultSettings() {
				this.$store.commit(
					'setAccountSettings',
					this.$store.state.defaultSettings
				)
				this.saveAccountToDatabase(this.$store.state.account)
				this.settings = this.getAccountSettings
			},

			createSettingString(settingValue) {
				return typeof(settingValue) == 'number' ? `${settingValue} mins` : settingValue
			}
		}
	}
</script>

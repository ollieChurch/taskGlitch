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

			<b-card-title>Task Length</b-card-title>
			<div class="mb-4">
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>short</b-card-text>
					</b-col>
					<b-col>
						<b-card-text
							>{{ settings.sizes.short }} mins</b-card-text
						>
					</b-col>
				</b-row>
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>mid</b-card-text>
					</b-col>
					<b-col>
						<b-card-text>{{ settings.sizes.mid }} mins</b-card-text>
					</b-col>
				</b-row>
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>long</b-card-text>
					</b-col>
					<b-col>
						<b-card-text
							>{{ settings.sizes.long }} mins</b-card-text
						>
					</b-col>
				</b-row>
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>very long</b-card-text>
					</b-col>
					<b-col>
						<b-card-text
							>{{ settings.sizes.veryLong }} mins</b-card-text
						>
					</b-col>
				</b-row>
			</div>

			<b-card-title>Breaks</b-card-title>
			<div class="mb-4">
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>break length</b-card-text>
					</b-col>
					<b-col>
						<b-card-text
							>{{ settings.breaks.length }} mins</b-card-text
						>
					</b-col>
				</b-row>
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>target frequency</b-card-text>
					</b-col>
					<b-col>
						<b-card-text
							>{{ settings.breaks.frequency }} mins</b-card-text
						>
					</b-col>
				</b-row>
			</div>

			<b-card-title>Rescheduling</b-card-title>
			<div class="mb-4">
				<b-row>
					<b-col class="col-6 col-sm-5 ps-4">
						<b-card-text>Maintain finish time</b-card-text>
					</b-col>
					<b-col>
						<b-card-text>{{
							settings.maintainFinishTimeWhenRescheduling
						}}</b-card-text>
					</b-col>
				</b-row>
			</div>
		</div>
		<b-btn
			variant="danger"
			class="font-weight-bold"
			@click="restoreDefaultSettings()"
		>
			Restore Defaults
		</b-btn>
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
			}
		}
	}
</script>

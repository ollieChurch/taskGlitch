<template>
	<b-modal id="scheduleSetUpModal" @ok="onSubmit" hide-header-close>
		<b-form ref="scheduleSetUpForm" class="text-left" @submit="onSubmit">
			<div>
				<label>Options</label>
				<div class="d-flex flex-wrap gap-3">
					<template>
						<input
							type="checkbox"
							class="btn-check"
							id="includeBreaksToggle"
							autocomplete="off"
							v-model="includeBreaks"
						/>
						<label
							class="btn btn-outline-success"
							for="includeBreaksToggle"
						>
							Add Breaks
						</label>
					</template>
				</div>
			</div>
			<b-form-group
				label="Date"
				label-for="sessionDate"
				class="form-input"
			>
				<b-form-datepicker
					id="sessionDate"
					v-model="sessionDate"
					:min="new Date()"
					reset-button
				></b-form-datepicker>
			</b-form-group>
			<b-form-group label="From" label-for="fromTime" class="form-input">
				<b-form-timepicker
					id="fromTime"
					v-model="fromTime"
					locale="en"
					now-button
					class="block"
					:hour12="false"
				></b-form-timepicker>
			</b-form-group>
			<b-form-group label="To" label-for="toTime" class="form-input">
				<b-form-timepicker
					id="toTime"
					v-model="toTime"
					locale="en"
					reset-button
					:hour12="false"
				></b-form-timepicker>
			</b-form-group>
			<b-form-group
				label="Categories To Include"
				label-for="categoriesToInclude"
				class="form-input"
			>
				<multiselect
					v-model="categoriesToInclude"
					:options="getCategories"
					multiple
					:allow-empty="false"
					placeholder="select categories"
					open-direction="bottom"
					:searchable="false"
					hide-selected
					:close-on-select="false"
				></multiselect>
			</b-form-group>
		</b-form>
	</b-modal>
</template>

<script>
	import { mapGetters } from 'vuex'
	import Multiselect from 'vue-multiselect'

	export default {
		components: {
			Multiselect
		},

		data() {
			return {
				sessionDate: new Date(),
				fromTime: new Date().toLocaleTimeString(),
				toTime: null,
				categoriesToInclude: null,
				finish: null,
				start: null,
				includeBreaks: false
			}
		},

		created() {
			this.categoriesToInclude = this.getCategories
		},

		computed: {
			...mapGetters(['getCategories', 'getPrioritisedTasks'])
		},

		methods: {
			onSubmit(event) {
				event.preventDefault()
				const filteredTasks = this.getPrioritisedTasks.filter(x =>
					this.categoriesToInclude.includes(x.category)
				)

				const calculatedTimes = this.getScheduleTimes(
					this.sessionDate,
					this.fromTime,
					this.toTime
				)

				const scheduleTasks = this.getScheduleTasks(
					filteredTasks,
					calculatedTimes.sessionInMins,
					this.includeBreaks
				)

				if (!this.toTime) {
					calculatedTimes.finish.setMinutes(
						calculatedTimes.start.getMinutes() +
							scheduleTasks.totalTaskTime
					)
				}

				const scheduleDetails = {
					categoriesToInclude: this.categoriesToInclude,
					tasks: scheduleTasks.tasks,
					start: calculatedTimes.start.toString(),
					finish: calculatedTimes.finish.toString(),
					includeBreaks: this.includeBreaks
				}

				this.saveScheduleToDatabase(scheduleDetails)

				this.$nextTick(() => {
					this.$bvModal.hide('scheduleSetUpModal')
					if (this.$route.path != '/schedule') {
						this.$router.push('/schedule')
					}
				})
			}
		}
	}
</script>

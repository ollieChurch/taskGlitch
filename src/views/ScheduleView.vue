<template>
	<div>
		<content-card>
			<glitch-explained
				v-if="!schedule"
				@createSchedule="openScheduleSetUp()"
			/>
			<div v-else>
				<div class="row mb-3 gap-3">
					<b-btn
						@click="openScheduleSetUp()"
						variant="success"
						block
						class="col font-weight-bold"
					>
						New Schedule
					</b-btn>
					<b-btn
						@click="deleteSchedule()"
						variant="danger"
						block
						class="col mt-0 font-weight-bold"
					>
						Delete Schedule
					</b-btn>
				</div>
				<div class="row gap-3">
					<b-btn
						@click="reschedule()"
						variant="warning"
						class="col font-weight-bold"
					>
						Reschedule
					</b-btn>
					<b-btn
						@click="() => console.log('export clicked')"
						variant="primary"
						class="col font-weight-bold"
						disabled
					>
						Export
					</b-btn>
				</div>
				<hr class="my-4" />
				<task-schedule />
			</div>
		</content-card>
		<schedule-set-up-modal />
	</div>
</template>

<script>
	import ScheduleSetUpModal from '@/components/ScheduleSetUpModal.vue'
	import GlitchExplained from '@/components/GlitchExplained.vue'
	import TaskSchedule from '@/components/TaskSchedule.vue'
	import ContentCard from '@/components/ContentCard.vue'

	export default {
		name: 'ScheduleView',

		components: {
			ContentCard,
			ScheduleSetUpModal,
			GlitchExplained,
			TaskSchedule,
		},

		created() {
			this.pageCheck()
		},

		computed: {
			schedule() {
				return this.$store.state.schedule
			},

			maintainFinish() {
				return this.$store.state.settings
					.maintainFinishTimeWhenRescheduling
			},

			taskType() {
				return this.$store.state.taskType
			}
		},

		methods: {
			openScheduleSetUp() {
				this.$bvModal.show('scheduleSetUpModal')
			},

			deleteSchedule() {
				this.saveScheduleToDatabase({})
			},

			reschedule() {
				const remainingTasks = this.schedule.tasks.filter(
					x => x.completed !== true && x.type !== this.taskType.systemBreak
				)

				const calculatedTimes = this.getScheduleTimes(
					this.schedule.start,
					new Date().toLocaleTimeString(),
					this.maintainFinish
						? new Date(this.schedule.finish).toLocaleTimeString()
						: null,
					this.maintainFinish ? this.schedule.finish : null
				)

				const scheduleDetails = {
					categoriesToInclude: this.schedule.categoriesToInclude,
					tasks: this.getScheduleTasks(
						remainingTasks,
						calculatedTimes.sessionInMins,
						this.schedule.includeBreaks
					).tasks,
					start: calculatedTimes.start.toString(),
					finish: calculatedTimes.finish.toString(),
					includeBreaks: this.schedule.includeBreaks
				}

				this.saveScheduleToDatabase(scheduleDetails)
			}
		}
	}
</script>

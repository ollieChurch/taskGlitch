<template>
	<div>
		<content-card>
			<!-- Loading state -->
			<div v-if="isLoadingSchedule" class="py-4">
				<skeleton-loader :lines="3" height="2.5rem" />
			</div>
			<glitch-explained
				v-else-if="!schedule"
				@createSchedule="openScheduleSetUp()"
			/>
			<div v-else>
				<div class="flex flex-wrap mb-3 gap-3">
					<button
						@click="openScheduleSetUp()"
						class="flex-1 bg-green-600 text-white py-2 px-4 rounded font-bold font-rajdhani hover:bg-green-700"
					>
						New Schedule
					</button>
					<button
						@click="deleteSchedule()"
						class="flex-1 bg-red-600 text-white py-2 px-4 rounded font-bold font-rajdhani hover:bg-red-700"
					>
						Delete Schedule
					</button>
				</div>
				<div class="flex flex-wrap gap-3">
					<button
						@click="reschedule()"
						class="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-bold font-rajdhani hover:bg-yellow-500"
					>
						Reschedule
					</button>
					<button
						@click="() => console.log('export clicked')"
						class="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-bold font-rajdhani opacity-50 cursor-not-allowed"
						disabled
					>
						Export
					</button>
				</div>
				<hr class="my-4" />
				<task-schedule />
			</div>
		</content-card>
		<schedule-set-up-modal ref="scheduleSetUpModalRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ScheduleSetUpModal from '@/components/ScheduleSetUpModal.vue'
import GlitchExplained from '@/components/GlitchExplained.vue'
import TaskSchedule from '@/components/TaskSchedule.vue'
import ContentCard from '@/components/ContentCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

export default {
	name: 'ScheduleView',

	components: {
		ContentCard,
		ScheduleSetUpModal,
		GlitchExplained,
		TaskSchedule,
		SkeletonLoader
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, saveScheduleToDatabase, getScheduleTimes, getScheduleTasks } = useTaskActions()
		return { store, pageCheck, saveScheduleToDatabase, getScheduleTimes, getScheduleTasks }
	},

	created() {
		this.pageCheck()
	},

	computed: {
		isLoadingSchedule() {
			return this.store.isLoadingSchedule
		},

		getAccountSettings() {
			return this.store.getAccountSettings
		},

		schedule() {
			return this.store.schedule
		},

		maintainFinish() {
			return (
				this.getAccountSettings.rescheduling.maintainFinishTime
			)
		},

		taskType() {
			return this.store.taskType
		}
	},

	methods: {
		openScheduleSetUp() {
			this.$refs.scheduleSetUpModalRef.show()
		},

		deleteSchedule() {
			this.saveScheduleToDatabase({})
		},

		reschedule() {
			const remainingTasks = this.schedule.tasks.filter(
				x =>
					x.completed !== true &&
					x.type !== this.taskType.systemBreak
			)

			const now = new Date()
			const startDateTime = new Date(this.schedule.start)
			const isStartTimeInPast = now > startDateTime

			console.log('start time is in past: ', isStartTimeInPast)

			const calculatedTimes = this.getScheduleTimes(
				this.schedule.start,
				isStartTimeInPast
					? now.toLocaleTimeString()
					: startDateTime.toLocaleTimeString(),
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

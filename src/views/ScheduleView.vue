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
				<!-- Schedule complete celebration -->
				<schedule-complete
					v-if="isScheduleComplete"
					:summary="scheduleSummary"
					@clearSchedule="deleteSchedule()"
					@newSchedule="openScheduleSetUp()"
				/>

				<!-- Normal schedule view -->
				<template v-else>
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
							class="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-bold font-rajdhani opacity-50 cursor-not-allowed"
							disabled
						>
							Export
						</button>
					</div>
					<hr class="my-4" />
					<task-schedule />
				</template>
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
import ScheduleComplete from '@/components/ScheduleComplete.vue'
import ContentCard from '@/components/ContentCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

export default {
	name: 'ScheduleView',

	components: {
		ContentCard,
		ScheduleSetUpModal,
		GlitchExplained,
		TaskSchedule,
		ScheduleComplete,
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
		},

		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		isScheduleComplete() {
			if (!this.schedule?.tasks || this.schedule.tasks.length === 0) return false

			// Check if there are any user tasks at all
			const userTasks = this.schedule.tasks.filter(
				t => t.type == null || t.type === this.taskType.userTask
			)
			if (userTasks.length === 0) return false

			// All user tasks must be completed (not in active backlog)
			return userTasks.every(
				t => !this.getPrioritisedTasks.find(x => x.id === t.id)
			)
		},

		scheduleSummary() {
			if (!this.schedule?.tasks) return {}

			const userTasks = this.schedule.tasks.filter(
				t => t.type == null || t.type === this.taskType.userTask
			)

			const tasksCompleted = userTasks.length
			const estimatedMins = userTasks.reduce((sum, t) => sum + (t.sizing || 0), 0)

			// Calculate actual duration from timing data
			let actualMins = null
			const tasksWithDuration = userTasks.filter(t => t.actualDuration != null)
			if (tasksWithDuration.length > 0) {
				actualMins = tasksWithDuration.reduce((sum, t) => sum + t.actualDuration, 0)
			}

			return {
				tasksCompleted,
				estimatedMins,
				actualMins
			}
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
			// Split current schedule into completed user tasks and remaining user tasks
			// Snapshot display times on completed tasks so they survive the start time change
			const completedTasks = this.schedule.tasks.filter(
				t => {
					const isUserTask = t.type == null || t.type === this.taskType.userTask
					return isUserTask && !this.getPrioritisedTasks.find(x => x.id === t.id)
				}
			).map(t => ({
				...t,
				completedTime: t.time || t.completedTime,
				completedDate: t.date || t.completedDate
			}))

			const remainingTasks = this.schedule.tasks.filter(
				t => {
					const isUserTask = t.type == null || t.type === this.taskType.userTask
					return isUserTask && this.getPrioritisedTasks.find(x => x.id === t.id)
				}
			)

			// If all tasks are completed, do nothing
			if (remainingTasks.length === 0) {
				return
			}

			const now = new Date()
			const startDateTime = new Date(this.schedule.start)
			const isStartTimeInPast = now > startDateTime

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

			// Schedule remaining tasks with fresh breaks
			const scheduledRemaining = this.getScheduleTasks(
				remainingTasks,
				calculatedTimes.sessionInMins,
				this.schedule.includeBreaks
			)

			// Set actualStartTime on the first remaining user task
			const firstRemainingUserTask = scheduledRemaining.tasks.find(
				t => t.type == null || t.type === this.taskType.userTask
			)
			if (firstRemainingUserTask) {
				firstRemainingUserTask.actualStartTime = new Date().toISOString()
			}

			// Concatenate: completed tasks at top, then rescheduled remaining
			const scheduleDetails = {
				categoriesToInclude: this.schedule.categoriesToInclude,
				tasks: [...completedTasks, ...scheduledRemaining.tasks],
				start: calculatedTimes.start.toString(),
				finish: calculatedTimes.finish.toString(),
				includeBreaks: this.schedule.includeBreaks
			}

			this.saveScheduleToDatabase(scheduleDetails)
		}
	}
}
</script>

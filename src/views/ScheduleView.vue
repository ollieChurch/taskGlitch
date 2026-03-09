<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
		<content-card>
			<!-- Loading state -->
			<div v-if="isLoadingSchedule" class="py-4">
				<skeleton-loader :lines="3" height="2.5rem" />
			</div>
			<glitch-explained
				v-else-if="!schedule"
				@createSchedule="openScheduleSetUp()"
			/>
			<div v-else class="md:flex-1 md:min-h-0 md:flex md:flex-col">
				<!-- Suggest adding a task after reschedule -->
				<div v-if="suggestedTask" class="depth-panel p-4 my-3 rounded-lg border border-accent-dim">
					<p class="font-rajdhani font-semibold text-text-heading text-sm mb-2">Time available — add another task?</p>
					<div class="flex items-center gap-2 mb-3">
						<span class="inline-flex items-center">
							<Zap v-if="suggestedTask.priority === 0" :size="14" style="color: #dc3546" />
							<ArrowUp v-else-if="suggestedTask.priority === 1" :size="14" style="color: #ffc107" />
							<Minus v-else-if="suggestedTask.priority === 2" :size="14" style="color: #1a8754" />
							<ArrowDown v-else :size="14" style="color: #a78bfa" />
						</span>
						<span class="font-rajdhani text-text-primary">{{ suggestedTask.name }}</span>
						<span class="text-xs font-rajdhani text-text-secondary">({{ store.getSizeLabel(suggestedTask.sizing) }})</span>
					</div>
					<div class="flex gap-2">
						<button
							@click="acceptSuggestion()"
							class="btn-themed flex-1 bg-app-success text-text-inverse py-1.5 px-3 text-sm font-rajdhani font-semibold hover:brightness-110 transition-all"
						>
							Add to Schedule
						</button>
						<button
							@click="dismissSuggestion()"
							class="btn-themed flex-1 bg-surface-hover text-text-primary border border-border-default py-1.5 px-3 text-sm font-rajdhani font-semibold hover:border-accent-dim transition-all"
						>
							No Thanks
						</button>
					</div>
				</div>

				<!-- Schedule complete celebration -->
				<schedule-complete
					v-if="isScheduleComplete && !suggestedTask"
					:summary="scheduleSummary"
					@clearSchedule="deleteSchedule()"
					@newSchedule="openScheduleSetUp()"
				/>

				<!-- Normal schedule view -->
				<template v-else>
					<div class="shrink-0 mt-2 mb-4">
						<!-- Primary action -->
						<div class="flex justify-center mb-3">
							<button
								@click="togglePause()"
								class="btn-themed flex items-center gap-2 w-full max-w-xs py-2.5 justify-center font-bold font-rajdhani text-sm transition-all"
								:class="isPaused
									? 'bg-app-success text-text-inverse hover:brightness-110'
									: 'bg-surface-hover border border-border-visible text-text-primary hover:border-accent-dim'"
							>
								<Pause v-if="!isPaused" :size="16" />
								<Play v-else :size="16" />
								{{ isPaused ? 'Resume Schedule' : 'Pause Schedule' }}
							</button>
						</div>

						<!-- Secondary actions — proper touch targets -->
						<div class="flex justify-center gap-2">
							<button
								@click="reschedule()"
								class="btn-themed flex items-center gap-1.5 px-3 py-2 text-xs font-rajdhani font-semibold bg-surface-hover border border-border-visible text-text-secondary hover:border-accent-dim hover:text-text-primary transition-all"
							>
								<RefreshCw :size="12" />
								Reschedule
							</button>
							<button
								@click="openScheduleSetUp()"
								class="btn-themed flex items-center gap-1.5 px-3 py-2 text-xs font-rajdhani font-semibold bg-surface-hover border border-border-visible text-text-secondary hover:border-accent-dim hover:text-text-primary transition-all"
							>
								<Plus :size="12" />
								New
							</button>
							<button
								@click="deleteSchedule()"
								class="btn-themed flex items-center gap-1.5 px-3 py-2 text-xs font-rajdhani font-semibold bg-surface-hover border border-border-visible text-text-secondary hover:border-app-danger hover:text-app-danger transition-all"
							>
								<Trash2 :size="12" />
								Delete
							</button>
						</div>
					</div>
					<hr class="border-border-default shrink-0" />
					<div class="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
						<div class="max-w-4xl mx-auto pt-4">
							<task-schedule @scheduleChanged="onScheduleChanged" />
						</div>
					</div>
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
import { Pause, Play, RefreshCw, Plus, Trash2, Zap, ArrowUp, Minus, ArrowDown } from 'lucide-vue-next'

export default {
	name: 'ScheduleView',

	components: {
		ContentCard,
		ScheduleSetUpModal,
		GlitchExplained,
		TaskSchedule,
		ScheduleComplete,
		SkeletonLoader,
		Pause,
		Play,
		RefreshCw,
		Plus,
		Trash2,
		Zap,
		ArrowUp,
		Minus,
		ArrowDown
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, saveScheduleToDatabase, getScheduleTimes, getScheduleTasks, findTaskToSuggest } = useTaskActions()
		return { store, pageCheck, saveScheduleToDatabase, getScheduleTimes, getScheduleTasks, findTaskToSuggest }
	},

	data() {
		return {
			suggestedTask: null
		}
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

		isPaused() {
			return !!this.schedule?.paused
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

		togglePause() {
			if (this.isPaused) {
				// Resume: reschedule remaining tasks from now, clear paused state
				this.reschedule({ clearPause: true })
			} else {
				// Pause: store paused state
				const updated = JSON.parse(JSON.stringify(this.schedule))
				updated.paused = true
				updated.pausedAt = new Date().toISOString()
				this.saveScheduleToDatabase(updated)
			}
		},

		reschedule({ clearPause } = {}) {
			this.suggestedTask = null

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

			// If all tasks are completed, check if there's space for a suggestion
			if (remainingTasks.length === 0) {
				this.checkForSuggestion(calculatedTimes.sessionInMins, completedTasks)
				return
			}

			// Schedule remaining tasks with fresh breaks
			const scheduledRemaining = this.getScheduleTasks(
				remainingTasks,
				calculatedTimes.sessionInMins,
				this.schedule.includeBreaks
			)

			// Check for available space after scheduling remaining tasks
			const availableSpace = calculatedTimes.sessionInMins - scheduledRemaining.totalTaskTime
			if (availableSpace > 0) {
				const scheduledIds = new Set([
					...completedTasks.map(t => t.id),
					...scheduledRemaining.tasks.map(t => t.id)
				])
				const suggestion = this.findTaskToSuggest(
					availableSpace,
					scheduledIds,
					this.schedule.categoriesToInclude
				)
				this.suggestedTask = suggestion
			}

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
				includeBreaks: this.schedule.includeBreaks,
				paused: clearPause ? false : (this.schedule.paused || false),
				pausedAt: clearPause ? null : (this.schedule.pausedAt || null)
			}

			this.saveScheduleToDatabase(scheduleDetails)
		},

		checkForSuggestion(sessionInMins, completedTasks) {
			const completedIds = new Set(completedTasks.map(t => t.id))
			const suggestion = this.findTaskToSuggest(
				sessionInMins,
				completedIds,
				this.schedule.categoriesToInclude
			)
			this.suggestedTask = suggestion
		},

		acceptSuggestion() {
			if (!this.suggestedTask) return

			// Add the suggested task to the current schedule and reschedule
			const updatedSchedule = JSON.parse(JSON.stringify(this.schedule))
			updatedSchedule.tasks.push(JSON.parse(JSON.stringify(this.suggestedTask)))
			this.saveScheduleToDatabase(updatedSchedule)

			this.suggestedTask = null

			// Reschedule to properly slot the new task with breaks
			this.$nextTick(() => {
				this.reschedule()
			})
		},

		dismissSuggestion() {
			this.suggestedTask = null
		},

		onScheduleChanged() {
			// Auto-reschedule after a task is completed or undone
			// Use nextTick to let the store update from moveTask first
			this.$nextTick(() => {
				if (!this.isScheduleComplete) {
					this.reschedule()
				} else {
					// All tasks completed — check for suggestion before showing complete screen
					const now = new Date()
					const finishTime = new Date(this.schedule.finish)
					const remainingMins = Math.floor((finishTime - now) / 1000 / 60)

					if (remainingMins > 0) {
						const scheduledIds = new Set(this.schedule.tasks.map(t => t.id))
						const suggestion = this.findTaskToSuggest(
							remainingMins,
							scheduledIds,
							this.schedule.categoriesToInclude
						)
						this.suggestedTask = suggestion
					}
				}
			})
		}
	}
}
</script>

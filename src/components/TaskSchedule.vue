<template>
	<div>
		<div class="flex items-center justify-between">
			<h5 class="text-left mb-3 font-rajdhani font-semibold">Schedule</h5>
			<label
				v-if="!isSimpleSchedule"
				class="relative inline-flex items-center cursor-pointer mb-3"
			>
				<input
					type="checkbox"
					v-model="isEditMode"
					class="sr-only peer"
				/>
				<div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
				<span class="ml-2 text-sm font-rajdhani">edit</span>
			</label>
		</div>

		<!-- Edit mode -->
		<div v-if="isEditMode && scheduleDetails?.tasks">
			<!-- Completed tasks (static, not draggable) -->
			<div
				v-for="task in completedScheduleTasks"
				:key="`schedule-completed-${task.id}`"
				class="flex items-center schedule-item"
			>
				<p
					class="w-3/12 text-left mb-0"
					:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
				>
					{{ task.time }}
				</p>
				<div class="my-2 p-2 bg-gray-50 rounded-lg shadow-sm border w-9/12 opacity-60">
					<div class="flex items-center justify-between">
						<h5
							class="text-left mb-0 pl-0 pr-2 w-full font-rajdhani font-semibold completed-task"
						>
							{{ task.name }}
						</h5>
					</div>
				</div>
			</div>

			<!-- Divider between completed and remaining in edit mode -->
			<div
				v-if="hasCompletedTasks && remainingScheduleTasks.length > 0"
				class="flex items-center my-3"
			>
				<div class="flex-1 border-t border-gray-300"></div>
				<span class="px-3 text-sm text-gray-500 font-rajdhani font-semibold">Remaining Tasks</span>
				<div class="flex-1 border-t border-gray-300"></div>
			</div>

			<!-- Remaining tasks (draggable) -->
			<VueDraggable
				v-model="remainingScheduleTasks"
				handle=".grab-handle"
				@update="onDragUpdate"
			>
				<div
					v-for="task in remainingScheduleTasks"
					:key="`schedule-${task.id}`"
					class="flex items-center schedule-item"
				>
					<p
						class="w-3/12 text-left mb-0"
						:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
					>
						{{ task.time }}
					</p>
					<div class="my-2 p-2 bg-white rounded-lg shadow-sm border w-9/12">
						<div class="flex items-center justify-between">
							<div class="w-1/12 pl-0 pr-3 grab-handle">
								<i class="fas fa-grip-horizontal"></i>
							</div>
							<h5
								class="text-left mb-0 pl-0 pr-2 w-9/12 font-rajdhani font-semibold"
							>
								{{ task.name }}
							</h5>
							<div class="w-2/12" v-if="!isSimpleSchedule">
								<button
									v-if="!task.completed"
									class="bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
									@click="removeFromSchedule(task)"
								>
									<i class="fas fa-times"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			</VueDraggable>
		</div>

		<!-- View mode -->
		<div v-else>
			<template
				v-for="task in scheduleDetails?.tasks"
				:key="`schedule-${task.id}`"
			>
				<div v-if="shouldDisplayDate(task)">
					<h5 class="mt-3 mb-1 text-left font-rajdhani font-semibold">
						{{ task.date }}
					</h5>
				</div>

				<!-- Divider between completed and remaining in view mode -->
				<div
					v-if="task.isFirstRemaining && hasCompletedTasks"
					class="flex items-center my-3"
				>
					<div class="flex-1 border-t border-gray-300"></div>
					<span class="px-3 text-sm text-gray-500 font-rajdhani font-semibold">Remaining Tasks</span>
					<div class="flex-1 border-t border-gray-300"></div>
				</div>

				<div class="flex items-center schedule-item">
					<p
						class="w-3/12 text-left mb-0 shrink-0"
						:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
					>
						{{ task.time }}
					</p>
					<div
						class="my-2 p-2 rounded-lg shadow-sm border w-9/12"
						:class="task.isActive ? 'bg-blue-50 border-blue-300' : 'bg-white'"
					>
						<div class="flex items-center justify-between">
							<div class="flex-1 pr-2 flex items-center gap-2">
								<h5
									class="text-left mb-0 pl-0 font-rajdhani font-semibold"
									:class="task.completed ? 'completed-task' : ''"
								>
									{{ task.name }}
								</h5>
								<span
									v-if="task.isActive"
									class="inline-flex items-center shrink-0 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-rajdhani font-semibold"
								>
									<span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
									In Progress
								</span>
							</div>
							<div class="shrink-0" v-if="!isSimpleSchedule">
								<button
									:class="task.completed
										? 'bg-yellow-400 text-black hover:bg-yellow-500'
										: 'bg-green-600 text-white hover:bg-green-700'"
									class="px-2 py-1 rounded"
									@click="toggleCompleted(task)"
								>
									<i
										:class="`fas ${
											task.completed
												? 'fa-undo'
												: 'fa-check-circle'
										}`"
									></i>
								</button>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div class="mt-3 bg-white rounded-lg shadow-sm border p-3">
			<h5 class="mb-0 font-rajdhani font-semibold">
				Estimated Finish Time
				{{ scheduleDetails.estimatedFinishTime }}
			</h5>
		</div>
		<div v-if="scheduleDetails.isOverflowing" class="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-left">
			<p class="font-rajdhani font-semibold text-yellow-800 mb-0">
				<i class="fas fa-exclamation-triangle mr-1"></i> Schedule runs past end time
			</p>
		</div>
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { logger } from '@/utils/logger'
import { VueDraggable } from 'vue-draggable-plus'

export default {
	components: { VueDraggable },
	props: ['isSimpleSchedule'],

	setup() {
		const store = useAppStore()
		const { moveTask, saveScheduleToDatabase } = useTaskActions()
		return { store, moveTask, saveScheduleToDatabase }
	},

	data() {
		return {
			isEditMode: false
		}
	},

	computed: {
		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		debug() {
			return this.store.debug
		},

		scheduleDetails() {
			const schedule = this.store.schedule

			if (schedule && schedule.tasks) {
				const startDateTime = new Date(schedule.start)
				let taskTime = new Date(startDateTime)

				schedule.tasks.forEach(task => {
					if (
						task.type == null ||
						task.type === this.taskType.userTask
					) {
						task.completed = !this.getPrioritisedTasks.find(
							x => x.id === task.id
						)
					}

					if (task.completed && task.completedTime) {
						// Completed task with stored time — preserve it
						task.time = task.completedTime
						task.date = task.completedDate || taskTime.toDateString()
					} else {
						// Remaining task (or completed without stored time) — calculate from schedule start
						task.time = taskTime.toLocaleTimeString([], {
							timeStyle: 'short'
						})
						task.date = taskTime.toDateString()
						taskTime = new Date(
							taskTime.setMinutes(
								taskTime.getMinutes() + task.sizing
							)
						)
					}
				})

				// Derive active task and first remaining marker
				let activeFound = false
				let firstRemainingFound = false
				schedule.tasks.forEach(task => {
					if (
						!activeFound &&
						!task.completed &&
						(task.type == null || task.type === this.taskType.userTask)
					) {
						task.isActive = true
						activeFound = true
					} else {
						task.isActive = false
					}

					// Mark the first non-completed task for divider placement
					if (!firstRemainingFound && !task.completed) {
						task.isFirstRemaining = true
						firstRemainingFound = true
					} else {
						task.isFirstRemaining = false
					}
				})

				schedule.estimatedFinishTime = taskTime.toLocaleTimeString(
					[],
					{
						timeStyle: 'short'
					}
				)

				// Detect if schedule overflows past the planned end time
				if (schedule.finish) {
					const scheduledFinish = new Date(schedule.finish)
					schedule.isOverflowing = taskTime > scheduledFinish
				} else {
					schedule.isOverflowing = false
				}
			}

			logger.log('scheduleDetails: ', schedule)
			return schedule
		},

		taskType() {
			return this.store.taskType
		},

		hasCompletedTasks() {
			if (!this.scheduleDetails?.tasks) return false
			return this.scheduleDetails.tasks.some(t =>
				(t.type == null || t.type === this.taskType.userTask) && t.completed
			)
		},

		completedScheduleTasks() {
			if (!this.scheduleDetails?.tasks) return []
			return this.scheduleDetails.tasks.filter(t => t.completed)
		},

		remainingScheduleTasks: {
			get() {
				if (!this.scheduleDetails?.tasks) return []
				return this.scheduleDetails.tasks.filter(t => !t.completed)
			},
			set(newRemaining) {
				// Reconstruct full task list: completed + reordered remaining
				const completed = this.scheduleDetails.tasks.filter(t => t.completed)
				this.scheduleDetails.tasks = [...completed, ...newRemaining]
			}
		}
	},

	methods: {
		toggleCompleted(task) {
			if (task.type == null || task.type === this.taskType.userTask) {
				const isCompleting = !task.completed
				const now = new Date().toISOString()

				if (isCompleting) {
					// Record end time on the completing task
					const scheduleTask = this.scheduleDetails.tasks.find(x => x.id === task.id)
					if (scheduleTask) {
						scheduleTask.actualEndTime = now
						if (scheduleTask.actualStartTime) {
							scheduleTask.actualDuration = Math.round(
								(new Date(now) - new Date(scheduleTask.actualStartTime)) / 1000 / 60
							)
						}

						// Copy timing data onto the task so moveTask carries it to Firebase
						task.actualStartTime = scheduleTask.actualStartTime
						task.actualEndTime = scheduleTask.actualEndTime
						task.actualDuration = scheduleTask.actualDuration
					}

					// Set start time on the next non-completed user task
					const nextTask = this.scheduleDetails.tasks.find(
						t => t.id !== task.id &&
							!t.completed &&
							(t.type == null || t.type === this.taskType.userTask)
					)
					if (nextTask) {
						nextTask.actualStartTime = now
					}

					// Persist timing data to schedule in Firebase
					this.updateSchedule(this.scheduleDetails)
				}

				const list = task.completed ? 'tasks' : 'completed'
				this.moveTask(task, list)
			}

			if (task.type === this.taskType.systemBreak) {
				let newSchedule = this.scheduleDetails
				newSchedule.tasks.find(x => x.id === task.id).completed =
					!task.completed
				this.updateSchedule(newSchedule)
			}
		},

		removeFromSchedule(task) {
			let newSchedule = this.scheduleDetails
			const taskToRemoveIndex = newSchedule.tasks.findIndex(
				x => x.id === task.id
			)

			if (taskToRemoveIndex > -1) {
				newSchedule.tasks.splice(taskToRemoveIndex, 1)
				this.updateSchedule(newSchedule)
			}
		},

		onDragUpdate() {
			// After drag reorder, reconstruct full list and save
			this.updateSchedule(this.scheduleDetails)
		},

		updateSchedule(newSchedule) {
			logger.log('new schedule: ', newSchedule)
			this.saveScheduleToDatabase(newSchedule)
			this.store.setSchedule(newSchedule)
		},

		shouldDisplayDate(task) {
			const schedule = this.scheduleDetails
			const taskIndex = schedule.tasks.findIndex(x => x.id == task.id)
			return taskIndex > 0
				? schedule.tasks[taskIndex - 1].date != task.date
				: true
		}
	}
}
</script>

<style scoped>
.completed-task {
	text-decoration: line-through;
	opacity: 0.5;
}

.grab-handle {
	cursor: grab;
}
</style>

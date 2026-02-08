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
		<div ref="draggableContainer">
			<div
				v-for="task in scheduleDetails.tasks"
				:key="`schedule-${task.id}`"
				class="flex items-center schedule-item"
			>
				<div v-if="!isEditMode && shouldDisplayDate(task)" class="w-full">
					<h5 class="mt-3 mb-1 text-left font-rajdhani font-semibold">
						{{ task.date }}
					</h5>
				</div>
				<p
					class="w-3/12 text-left mb-0"
					:class="isSimpleSchedule ? 'text-lg' : 'text-2xl'"
				>
					{{ task.time }}
				</p>
				<div class="my-2 p-2 bg-white rounded-lg shadow-sm border w-9/12">
					<div class="flex items-center justify-between">
						<div
							v-if="isEditMode"
							class="w-1/12 pl-0 pr-3 grab-handle"
						>
							<i class="fas fa-grip-horizontal"></i>
						</div>
						<h5
							class="text-left mb-0 pl-0 pr-2 w-9/12 font-rajdhani font-semibold"
							:class="task.completed ? 'completed-task' : ''"
						>
							{{ task.name }}
						</h5>
						<div class="w-2/12" v-if="!isSimpleSchedule">
							<button
								v-if="isEditMode && !task.completed"
								class="bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
								@click="removeFromSchedule(task)"
							>
								<i class="fas fa-times"></i>
							</button>
							<button
								v-else
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
		</div>
		<div class="mt-3 bg-white rounded-lg shadow-sm border p-3">
			<h5 class="mb-0 font-rajdhani font-semibold">
				Estimated Finish Time
				{{ scheduleDetails.estimatedFinishTime }}
			</h5>
		</div>
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'

export default {
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
					task.time = taskTime.toLocaleTimeString([], {
						timeStyle: 'short'
					})
					task.date = taskTime.toDateString()
					taskTime = new Date(
						taskTime.setMinutes(
							taskTime.getMinutes() + task.sizing
						)
					)

					if (
						task.type == null ||
						task.type === this.taskType.userTask
					) {
						task.completed = !this.getPrioritisedTasks.find(
							x => x.id === task.id
						)
					}
				})

				schedule.estimatedFinishTime = taskTime.toLocaleTimeString(
					[],
					{
						timeStyle: 'short'
					}
				)
			}

			console.log('scheduleDetails: ', schedule)
			return schedule
		},

		taskType() {
			return this.store.taskType
		}
	},

	methods: {
		toggleCompleted(task) {
			if (task.type == null || task.type === this.taskType.userTask) {
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

		updateSchedule(newSchedule) {
			console.log('new schedule: ', newSchedule)
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

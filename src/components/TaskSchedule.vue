<template>
	<div>
		<div class="d-flex align-items-center justify-content-between">
			<b-card-title class="text-left mb-3">Schedule</b-card-title>
			<b-form-checkbox
				v-if="!isSimpleSchedule"
				v-model="isEditMode"
				switch
				size="lg"
				inline
				class="text-right mr-0 mb-3"
			>
				edit
			</b-form-checkbox>
		</div>
		<draggable
			v-model="scheduleDetails.tasks"
			draggable=".schedule-item"
			@change="updateSchedule(scheduleDetails)"
			handle=".grab-handle"
		>
			<!-- <div> -->

			<div
				v-for="task in scheduleDetails.tasks"
				:key="`schedule-${task.id}`"
				class="row align-items-center px-0 mx-0 schedule-item"
			>
				<div v-if="!isEditMode && shouldDisplayDate(task)" class="row px-0 mx-0">
					<b-card-title class="px-0 mt-3 mb-1 text-left">{{
						task.date
					}}</b-card-title>
				</div>
				<p
					class="col-3 text-left px-0 mb-0"
					:class="isSimpleSchedule ? 'h3' : 'h1'"
				>
					{{ task.time }}
				</p>
				<b-card class="my-2 p-2 task-card col-9" no-body>
					<div
						class="row align-items-center justify-content-between mx-0"
					>
						<div
							v-if="isEditMode"
							class="col-1 pl-0 pr-3 grab-handle"
						>
							<i class="fas fa-grip-horizontal"></i>
						</div>
						<b-card-title
							class="text-start mb-0 ps-0 pe-2 col-9"
							:class="task.completed ? 'completed-task' : ''"
						>
							{{ task.name }}
						</b-card-title>
						<div class="col-2" v-if="!isSimpleSchedule">
							<b-button
								v-if="isEditMode && !task.completed"
								variant="info"
								@click="removeFromSchedule(task)"
							>
								<b-icon icon="x"></b-icon>
							</b-button>
							<b-button
								v-else
								:variant="
									task.completed ? 'warning' : 'success'
								"
								@click="toggleCompleted(task)"
							>
								<b-icon
									:icon="
										task.completed
											? 'arrow-counterclockwise'
											: 'check-circle'
									"
								></b-icon>
							</b-button>
						</div>
					</div>
				</b-card>
			</div>
			<!-- </div> -->
		</draggable>
		<b-card class="mt-3">
			<b-card-title class="mb-0">
				Estimated Finish Time
				{{ scheduleDetails.estimatedFinishTime }}
			</b-card-title>
		</b-card>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import draggable from 'vuedraggable'

	export default {
		components: {
			draggable
		},

		props: ['isSimpleSchedule'],

		data() {
			return {
				isEditMode: false
			}
		},

		computed: {
			...mapGetters(['getPrioritisedTasks']),

			debug() {
				return this.$store.state.debug
			},

			scheduleDetails() {
				const schedule = this.$store.state.schedule

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
				return this.$store.state.taskType
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
				this.$store.commit('setSchedule', newSchedule)
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

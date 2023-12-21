<template>
	<div>
		<div class="d-flex align-items-center justify-content-between">
			<b-card-title class="text-left mb-3">Schedule</b-card-title>
			<b-form-checkbox v-model="isEditMode" switch size="lg" inline class="text-right mr-0 mb-3">
				edit
			</b-form-checkbox>
		</div>
		<draggable
			v-model="scheduleDetails.tasks"
			draggable=".schedule-item"
			@change="updateSchedule(scheduleDetails)"
			handle=".grab-handle"
		>
			<div
				v-for="task in scheduleDetails.tasks"
				:key="`schedule-${task.id}`"
				class="row align-items-center px-0 mx-0 schedule-item"
			>
				<h1 v-if="!isEditMode" class="col-3 text-left px-0 mb-0">
					{{ task.time }}
				</h1>
				<b-card class="my-2 p-2 task-card col" no-body>
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
						<div class="col-2">
							<b-button
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
		</draggable>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import draggable from 'vuedraggable'

	export default {
		components: {
			draggable
		},

		data() {
			return {
				isEditMode: false
			}
		},

		computed: {
			...mapGetters(['getPrioritisedTasks']),

			scheduleDetails() {
				const schedule = this.$store.state.schedule

				if (schedule && schedule.tasks) {
					const startDateTime = new Date(schedule.start)
					let taskTime = new Date(startDateTime)

					schedule.tasks.forEach(task => {
						task.time = taskTime.toLocaleTimeString([], {
							timeStyle: 'short'
						})
						task.date = taskTime.toLocaleDateString()
						taskTime = new Date(
							taskTime.setMinutes(
								taskTime.getMinutes() + task.sizing
							)
						)
						task.completed = !this.getPrioritisedTasks.find(
							x => x.id === task.id
						)
					})
				}

				console.log('scheduleDetails: ', schedule)
				return schedule
			}
		},

		methods: {
			toggleCompleted(task) {
				const list = task.completed ? 'tasks' : 'completed'
				this.moveTask(task, list)
			},

			updateSchedule(newSchedule) {
				console.log('new schedule: ', newSchedule)
				this.saveScheduleToDatabase(newSchedule)
				this.$store.commit('setSchedule', newSchedule)
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

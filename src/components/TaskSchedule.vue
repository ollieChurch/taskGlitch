<template>
	<div>
		<div class="d-flex justify-content-between">
			<b-card-title>Glitch Status: </b-card-title>
			<b-card-title :class="`font-weight-bold text-${status.color}`">
				{{ status.text }}
			</b-card-title>
		</div>
		<hr class="my-4" />
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
			<div
				v-for="task in scheduleDetails.tasks"
				:key="`schedule-${task.id}`"
				class="row align-items-center px-0 mx-0 schedule-item"
			>
				<p
					v-if="!isEditMode"
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

		props: ['isSimpleSchedule'],

		data() {
			return {
				isEditMode: false,
				status: {
					text: 'calculating...',
					color: 'black'
				}
			}
		},

		mounted() {
			this.status = this.setStatus()
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
				this.status = this.setStatus()
			},

			updateSchedule(newSchedule) {
				console.log('new schedule: ', newSchedule)
				this.saveScheduleToDatabase(newSchedule)
				this.$store.commit('setSchedule', newSchedule)
				this.status = this.setStatus()
			},

			getTaskDateTime(task) {
				const year = task.date.substring(6)
				const month = Number(task.date.substring(3, 5)) - 1
				const day = task.date.substring(0, 2)
				const hour = task.time.substring(0, 2)
				const minute = task.time.substring(3)

				return new Date(year, month, day, hour, minute)
			},

			setStatus() {
				const currentDateTime = new Date()
				const tasks = this.scheduleDetails.tasks
				const nextTaskIndex = tasks.findIndex(x => !x.completedDateTime)
				const secondTaskIndex = tasks.findIndex(
					x =>
						!x.completedDateTime && x.id !== tasks[nextTaskIndex].id
				)

				const nextTaskDateTime =
					nextTaskIndex !== -1 && !tasks[nextTaskIndex].completed
						? this.getTaskDateTime(tasks[nextTaskIndex])
						: null

				let secondTaskDateTime =
					secondTaskIndex !== -1 && !tasks[secondTaskIndex].completed
						? this.getTaskDateTime(tasks[secondTaskIndex])
						: this.scheduleDetails.endDateTime

				if (nextTaskDateTime && !secondTaskDateTime) {
					const lastTask = tasks[tasks.length - 1]
					const lastTaskDateTime = this.getTaskDateTime(lastTask)
					lastTaskDateTime.setMinutes(
						lastTaskDateTime.getMinutes() + lastTask.sizing
					)
					secondTaskDateTime = lastTaskDateTime
				}

				if (nextTaskIndex === -1) {
					return {
						text: 'All Done',
						color: 'primary'
					}
				} else if (
					secondTaskIndex !== -1 &&
					secondTaskDateTime < currentDateTime
				) {
					return {
						text: 'Late',
						color: 'danger'
					}
				} else if (
					nextTaskDateTime < currentDateTime &&
					secondTaskDateTime > currentDateTime
				) {
					return {
						text: 'On Time',
						color: 'warning'
					}
				} else {
					return {
						text: 'Ahead',
						color: 'success'
					}
				}
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

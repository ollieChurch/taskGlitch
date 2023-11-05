<template>
	<div>
		<b-card-title class="text-left">Schedule</b-card-title>
		<div
			v-for="task in scheduleDetails.tasks"
			:key="`schedule-${task.id}`"
			class="row align-items-center px-0 mx-0"
		>
			<h1 class="col-3 mb-0 px-0 text-left">{{ task.time }}</h1>
			<b-card class="my-2 p-2 task-card col" no-body>
				<div class="row align-items-center mx-0">
					<b-card-title
						class="text-start mb-0 ps-0 pe-2 col-10"
						:class="task.completed ? 'completed-task' : ''"
					>
						{{ task.name }}
					</b-card-title>
					<div class="col-2">
						<b-button
							:variant="task.completed ? 'warning' : 'success'"
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
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'

	export default {
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
			}
		}
	}
</script>

<style scoped>
    .completed-task {
        text-decoration: line-through;
        opacity: 0.5;
    }
</style>

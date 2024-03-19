<template>
	<div>
		<content-card>
			<h1 class="text-left mb-2">Dashboard</h1>
			<hr class="pb-4"/>
			<div class="row">
				<div
					class="col d-flex flex-column justify-content-between align-items-center mb-3 gap-3"
				>
					<b-btn
						@click="openScheduleSetUp()"
						variant="primary"
						class="font-weight-bold py-2 px-4"
						style="font-size: 1.75rem;"
					>
						<b-icon icon="stars"></b-icon>
					</b-btn>
					<b-card-title class="text-start">
						Schedule with Glitch
					</b-card-title>
				</div>

				<div
					class="col d-flex flex-column justify-content-between align-items-center mb-3 gap-3"
				>
					<b-btn
						@click="addTask()"
						variant="success"
						class="font-weight-bold py-2 px-4"
						style="font-size: 1.75rem;"
					>
						<b-icon icon="plus-lg"></b-icon>
					</b-btn>
					<b-card-title class="text-start">
						Add a new task
					</b-card-title>
				</div>
			</div>
			<hr class="pb-4" />
			<div class="mb-4">
				<b-card-title class="text-start font-weight-bold">
					Highest Priority Task
				</b-card-title>
				<task-card :task="highestPriorityTask" class="mt-3" />
			</div>
			<div class="mb-4">
				<b-card-title class="text-start font-weight-bold">Oldest Task</b-card-title>
				<task-card :task="oldestTask" class="mt-3" />
			</div>
			<div>
				<b-card-title class="text-start mb-2 font-weight-bold">
					Backlog Breakdown
				</b-card-title>
				<b-card>
					<b-tabs fill>
						<b-tab title="Categories" class="pt-4">
							<doughnut
								:data="categoryBreakdownData"
								:options="chartOptions"
								class="mx-auto"
							/>
						</b-tab>
						<b-tab title="Priorities" class="pt-4">
							<doughnut
								:data="priorityBreakdownData"
								:options="chartOptions"
								class="mx-auto"
							/>
						</b-tab>
					</b-tabs>
				</b-card>
			</div>
		</content-card>
		<task-modal />
		<schedule-set-up-modal />
	</div>
</template>

<script>
	import ContentCard from '../components/ContentCard.vue'
	import TaskCard from '../components/TaskCard.vue'
	import TaskModal from '../components/TaskModal.vue'
	import ScheduleSetUpModal from '../components/ScheduleSetUpModal.vue'
	import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
	import { Doughnut } from 'vue-chartjs'
	import { mapGetters } from 'vuex'

	ChartJS.register(ArcElement, Tooltip, Legend)

	export default {
		name: 'DashboardView',

		components: {
			ContentCard,
			TaskModal,
			Doughnut,
			TaskCard,
			ScheduleSetUpModal
		},

		data() {
			return {
				categoryBreakdownData: { datasets: [] },
				priorityBreakdownData: { datasets: [] },

				chartOptions: {
					responsive: false,
					maintainAspectRatio: true
				}
			}
		},

		created() {
			this.pageCheck()
			this.setUpCategoryBreakdown()
			this.setUpPriorityBreakdown()
		},

		computed: {
			...mapGetters([
				'getCategories',
				'getPrioritisedTasks',
				'getPriorityNames'
			]),

			priorities() {
				return this.$store.state.priorities
			},

			oldestTask() {
				const tasks = this.getPrioritisedTasks

				if (tasks && tasks.length > 0) {
					const tasksSortedByCreatedDate = tasks.sort((a, b) =>
						a.createdDateTime > b.createdDateTime
							? 1
							: b.createdDateTime > a.createdDateTime
								? -1
								: 0
					)
					return tasksSortedByCreatedDate[0]
				} else {
					return null
				}
			},

			highestPriorityTask() {
				const tasks = this.getPrioritisedTasks
				if (tasks && tasks.length > 0) {
					const tasksSortedByPriority = tasks.sort((a, b) =>
						a.score > b.score
							? 1
							: b.score > a.score
								? -1
								: 0
					)
					return tasksSortedByPriority[0]
				} else {
					return null
				}
			}
		},

		methods: {
			addTask() {
				this.$bvModal.show('taskModal')
			},

			openScheduleSetUp() {
				this.$bvModal.show('scheduleSetUpModal')
			},

			setUpCategoryBreakdown() {
				let labels = []
				let data = []
				let backgroundColor = []

				this.getCategories.forEach(category => {
					labels.push(category)
					const tasksInCategory = this.getPrioritisedTasks.filter(
						x => x.category == category
					)
					data.push(tasksInCategory.length)
					backgroundColor.push(this.getRandomColor())
				})

				this.categoryBreakdownData.labels = labels
				this.categoryBreakdownData.datasets.push({
					data,
					backgroundColor
				})
			},

			setUpPriorityBreakdown() {
				let labels = []
				let data = []
				let backgroundColor = []

				this.getPriorityNames.forEach(priority => {
					labels.push(priority)
					const tasksInPriority = this.getPrioritisedTasks.filter(
						x => x.priority == this.priorities[priority].value
					)
					data.push(tasksInPriority.length)
					backgroundColor.push(this.priorities[priority].color)
				})

				this.priorityBreakdownData.labels = labels
				this.priorityBreakdownData.datasets.push({
					data,
					backgroundColor
				})
			},

			getRandomColor() {
				return `#${Math.floor(Math.random() * 16777215).toString(16)}`
			}
		}
	}
</script>

<style scoped>
	.card-body {
		padding: 0 0 1.5rem;
	}
</style>

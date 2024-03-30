<template>
	<div>
		<content-card>
			<h1 class="text-left mb-2">Dashboard</h1>
			<hr class="pb-4" />
			<div class="row">
				<icon-button
					@buttonClicked="() => openScheduleSetUp()"
					variant="primary"
					icon="stars"
					label="Glitch it"
				/>

				<icon-button
					@buttonClicked="() => addTask()"
					variant="success"
					icon="plus-lg"
					label="Add task"
				/>
			</div>
			<hr class="pb-4" />
			<filter-widget
				title="Highest Priority Task"
				:tasks="[getPrioritisedTasks[0]]"
			/>
			<filter-widget
				title="Oldest Task"
				:tasks="[getTasksInCreatedOrder[0]]"
			/>
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
	import TaskModal from '../components/TaskModal.vue'
	import ScheduleSetUpModal from '../components/ScheduleSetUpModal.vue'
	import IconButton from '../components/IconButton.vue'
	import FilterWidget from '../components/FilterWidget.vue'
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
			ScheduleSetUpModal,
			IconButton,
			FilterWidget
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
				'getPriorityNames',
				'getTasksInCreatedOrder'
			]),

			priorities() {
				return this.$store.state.priorities
			}
		},

		methods: {
			addTask() {
				this.$bvModal.show('taskModal')
			},

			openScheduleSetUp() {
				if (this.$store.state.schedule) {
					this.$router.push('/schedule')
				} else {
					this.$bvModal.show('scheduleSetUpModal')
				}
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

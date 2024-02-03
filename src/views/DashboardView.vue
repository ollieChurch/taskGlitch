<template>
	<div>
		<content-card>
			<h1>Dashboard</h1>
			<b-btn @click="logout()">Logout</b-btn>
			<b-btn @click="addTask()">Add Task</b-btn>
			<b-card-title class="text-start mt-4 mb-2">
				Categories
			</b-card-title>
			<doughnut
				:data="categoryBreakdownData"
				:options="chartOptions"
				style="width: 100%"
			/>
			<b-card-title class="text-start mt-4 mb-2">
				Priorities
			</b-card-title>
			<doughnut
				:data="priorityBreakdownData"
				:options="chartOptions"
				style="width: 100%"
			/>
		</content-card>
		<task-modal />
	</div>
</template>

<script>
	import { signOut } from 'firebase/auth'
	import ContentCard from '../components/ContentCard.vue'
	import TaskModal from '../components/TaskModal.vue'
	import {
		Chart as ChartJS,
		ArcElement,
	Tooltip,
		Legend
	} from 'chart.js'
	import { Doughnut } from 'vue-chartjs'
	import { mapGetters } from 'vuex'

	ChartJS.register(
		ArcElement,
		Tooltip,
		Legend
	)

	export default {
		name: 'DashboardView',

		components: {
			ContentCard,
			TaskModal,
			Doughnut
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
				'getPriorityNames'			]),

			priorities() {
				return this.$store.state.priorities
			}
		},

		methods: {
			logout() {
				signOut(this.$store.state.auth)
				this.$router.push('/login')
			},

			addTask() {
				this.$bvModal.show('taskModal')
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
						x =>
							x.priority ==
							this.priorities[priority].value
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

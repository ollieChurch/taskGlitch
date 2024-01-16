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
			<b-card-title class="text-start mt-4 mb-0">
				Average time to resolve (hours)
			</b-card-title>
			<line-chart
				:data="averageTimeToResolveData"
				:options="chartOptions"
				style="width: 100%"
			/>
			<b-card-title class="text-start mt-4 mb-0">
				Tasks Resolved
			</b-card-title>
			<bar
				:data="resolvedRateData"
				:options="chartOptions"
				style="width: 100%"
			/>
			<b-card-title class="text-start mt-4 mb-0">
				Tasks Created vs Resolved
			</b-card-title>
			<line-chart
				:data="createdVsResolvedData"
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
		Legend,
		LineElement,
		CategoryScale,
		LinearScale,
		PointElement,
		BarElement
	} from 'chart.js'
	import { Doughnut, Line as LineChart, Bar } from 'vue-chartjs'
	import { mapGetters } from 'vuex'

	ChartJS.register(
		ArcElement,
		Tooltip,
		Legend,
		LineElement,
		CategoryScale,
		LinearScale,
		PointElement,
		BarElement
	)

	export default {
		name: 'DashboardView',

		components: {
			ContentCard,
			TaskModal,
			Doughnut,
			LineChart,
			Bar
		},

		data() {
			return {
				timeRangeInMonths: 3,
				completedTasksInRange: {},
				createdTasksInRange: {},

				categoryBreakdownData: { datasets: [] },
				priorityBreakdownData: { datasets: [] },
				averageTimeToResolveData: { datasets: [] },
				resolvedRateData: { datasets: [] },
				createdVsResolvedData: { datasets: [] },

				chartOptions: {
					responsive: false,
					maintainAspectRatio: true
				}
			}
		},

		created() {
			this.pageCheck()
			this.completedTasksInRange = this.getTasksInRange(
				this.completed,
				'completedDateTime'
			)
			this.createdTasksInRange = this.getTasksInRange(
				this.getAllTasks,
				'createdDateTime'
			)
			this.setUpCategoryBreakdown()
			this.setUpPriorityBreakdown()
			this.setUpTimeToResolveData()
			this.setUpResolvedRateData()
		},

		computed: {
			...mapGetters([
				'getCategories',
				'getPrioritisedTasks',
				'getPriorityNames',
				'getAllTasks'
			]),

			completed() {
				return this.$store.state.completed
			},

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

			getTasksInRange(tasksArray, dateToUse) {
				const today = new Date()
				let startMonth = today.getMonth() - this.timeRangeInMonths
				if (startMonth < 0) startMonth = 0 + startMonth

				let earliestDate = new Date(today.getFullYear(), startMonth, 1)

				const earliestUnix = earliestDate.getTime()

				const tasksInRange = tasksArray.filter(
					x => new Date(x[dateToUse]).getTime() >= earliestUnix
				)

				const tasksSplitByMonthCompleted = this.splitTasksByMonth(
					tasksInRange,
					'completedDateTime'
				)

				const tasksSplitByMonthCreated = this.splitTasksByMonth(
					tasksInRange,
					'createdDateTime'
				)

				return {
					byMonthCompleted: tasksSplitByMonthCompleted,
					byMonthCreated: tasksSplitByMonthCreated,
					numberByMonthCreated: this.getNumberByMonth(
						tasksSplitByMonthCreated,
						'createdDateTime'
					),
					numberByMonthCompleted: this.getNumberByMonth(
						tasksSplitByMonthCompleted,
						'completedDateTime'
					),
					totalNumberOfTasks: tasksInRange.length
				}
			},

			getNumberByMonth(arrayOfTasks, dateToUse) {
				return arrayOfTasks.map(month => {
					return {
						label: new Date(month[0][dateToUse]).toLocaleString(
							'default',
							{ month: 'long' }
						),
						value: month.length
					}
				})
			},

			splitTasksByMonth(tasks, dateToUse) {
				tasks.sort(function (a, b) {
					return new Date(a[dateToUse]) - new Date(b[dateToUse])
				})

				let currentMonth = null
				let tasksSplitByMonth = []
				tasks.forEach(task => {
					const taskMonth = new Date(task[dateToUse]).getMonth()

					if (taskMonth === currentMonth) {
						tasksSplitByMonth[tasksSplitByMonth.length - 1].push(
							task
						)
					} else {
						tasksSplitByMonth.push([task])
					}

					currentMonth = taskMonth
				})

				return tasksSplitByMonth
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

			setUpTimeToResolveData() {
				const averageHoursToResolve =
					this.completedTasksInRange.byMonthCompleted.map(month => {
						let monthResolutionTimes = []
						month.forEach(task => {
							const resolutionTimeInMs =
								new Date(task.completedDateTime).getTime() -
								new Date(task.createdDateTime).getTime()
							monthResolutionTimes.push(resolutionTimeInMs)
						})

						return {
							label: new Date(
								month[0].completedDateTime
							).toLocaleString('default', { month: 'long' }),
							value: (
								this.calculateAverage(monthResolutionTimes) /
								1000 /
								3600
							).toFixed(2)
						}
					})

				this.averageTimeToResolveData.labels =
					averageHoursToResolve.map(month => month.label)

				this.averageTimeToResolveData.datasets.push({
					label: 'Time To Resolve (hrs)',
					data: averageHoursToResolve.map(month => month.value),
					borderColor: this.getRandomColor()
				})
			},

			setUpResolvedRateData() {
				const labels =
					this.createdTasksInRange.numberByMonthCreated.map(
						month => month.label
					)

				const dataset = {
					label: `resolved (${this.completedTasksInRange.totalNumberOfTasks})`,
					data: this.completedTasksInRange.numberByMonthCompleted.map(
						month => month.value
					)
				}

				this.resolvedRateData.labels = labels
				this.resolvedRateData.datasets.push({
					...dataset,
					backgroundColor: '#0edb07'
				})

				this.createdVsResolvedData.labels = labels
				this.createdVsResolvedData.datasets.push({
					label: `created (${this.createdTasksInRange.totalNumberOfTasks})`,
					data: this.createdTasksInRange.numberByMonthCreated.map(
						month => month.value
					),
					borderColor: '#fc036f'
				})

				this.createdVsResolvedData.datasets.push({
					...dataset,
					borderColor: '#0edb07'
				})
			},

			getRandomColor() {
				return `#${Math.floor(Math.random() * 16777215).toString(16)}`
			},

			calculateAverage(array) {
				const sum = array.reduce((acc, val) => acc + val, 0)
				return array.length ? sum / array.length : 0
			}
		}
	}
</script>

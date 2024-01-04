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
			<b-card-sub-title class="text-start mb-2">
				Data for the last {{ timeRangeInDays }} days
			</b-card-sub-title>
			<line-chart
				:data="averageTimeToResolveData"
				:options="chartOptions"
				style="width: 100%"
			/>
			<b-card-title class="text-start mt-4 mb-0">
				Tasks Created
			</b-card-title>
			<b-card-sub-title class="text-start mb-2">
				Data for the last {{ timeRangeInDays }} days
			</b-card-sub-title>
			<bar
				:data="createdRateData"
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
				timeRangeInDays: 90,
				completedTasksInRange: {},
				createdTasksInRange: {},

				categoryBreakdownData: {
					labels: [],
					datasets: []
				},

				priorityBreakdownData: {
					labels: [],
					datasets: []
				},

				averageTimeToResolveData: {
					labels: [],
					datasets: [
						{
							label: 'Time To Resolve (hrs)',
							data: [],
							borderColor: this.getRandomColor(),
							tension: 0
						}
					]
				},

				createdRateData: {
					labels: [],
					datasets: []
				},

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
			this.setUpAverageTimeToResolve()
			this.setUpCreatedRateData()
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
				const timeRangeInMiliseconds =
					this.timeRangeInDays * 86400 * 1000
				const earliestUnix = Date.now() - timeRangeInMiliseconds

				const tasksInRange = tasksArray.filter(
					x => new Date(x[dateToUse]).getTime() >= earliestUnix
				)

				const tasksSplitByMonthCompleted = this.splitTasksByMonth(
					tasksInRange,
					dateToUse
				)
				const tasksSplitByMonthCreated = this.splitTasksByMonth(
					tasksInRange,
					dateToUse
				)

				return {
					byMonthCompleted: tasksSplitByMonthCompleted,
					byMonthCreated: tasksSplitByMonthCreated
				}
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
							this.$store.state.settings.priorities[priority]
					)
					data.push(tasksInPriority.length)
					backgroundColor.push(this.getRandomColor())
				})

				this.priorityBreakdownData.labels = labels
				this.priorityBreakdownData.datasets.push({
					data,
					backgroundColor
				})
			},

			setUpAverageTimeToResolve() {
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

				this.averageTimeToResolveData.datasets[0].data =
					averageHoursToResolve.map(month => month.value)
			},

			setUpCreatedRateData() {
				console.log('createdTasksInRange: ', this.getAllTasks)

				const monthlyCreatedRate =
					this.createdTasksInRange.byMonthCreated.map(month => {
						return {
							label: new Date(
								month[0].createdDateTime
							).toLocaleString('default', { month: 'long' }),
							value: month.length
						}
					})

				this.createdRateData.labels = monthlyCreatedRate.map(
					month => month.label
				)
				this.createdRateData.datasets.push({
					label: 'created rate',
					data: monthlyCreatedRate.map(month => month.value),
					backgroundColor: this.getRandomColor()
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

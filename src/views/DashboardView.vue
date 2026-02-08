<template>
	<div>
		<content-card>
			<h1 class="text-left mb-2 font-rajdhani font-bold text-2xl">Dashboard</h1>
			<hr class="pb-4" />
			<div class="flex flex-wrap gap-3">
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
			<hr class="pb-4 mt-4" />
			<filter-widget
				title="Highest Priority Task"
				:tasks="[getPrioritisedTasks[0]]"
			/>
			<filter-widget
				title="Oldest Task"
				:tasks="[getTasksInCreatedOrder[0]]"
			/>
			<div>
				<h5 class="text-start mb-2 font-bold font-rajdhani">
					Backlog Breakdown
				</h5>
				<div class="bg-white rounded-lg shadow-sm border">
					<BaseTabs fill>
						<BaseTab title="Categories">
							<div class="pt-4 pb-6">
								<doughnut
									:data="categoryBreakdownData"
									:options="chartOptions"
									class="mx-auto"
								/>
							</div>
						</BaseTab>
						<BaseTab title="Priorities">
							<div class="pt-4 pb-6">
								<doughnut
									:data="priorityBreakdownData"
									:options="chartOptions"
									class="mx-auto"
								/>
							</div>
						</BaseTab>
					</BaseTabs>
				</div>
			</div>
		</content-card>
		<task-modal ref="taskModalRef" />
		<schedule-set-up-modal ref="scheduleSetUpModalRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import ScheduleSetUpModal from '@/components/ScheduleSetUpModal.vue'
import IconButton from '@/components/IconButton.vue'
import FilterWidget from '@/components/FilterWidget.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
	name: 'DashboardView',

	components: {
		ContentCard,
		TaskModal,
		Doughnut,
		ScheduleSetUpModal,
		IconButton,
		FilterWidget,
		BaseTabs,
		BaseTab
	},

	setup() {
		const store = useAppStore()
		const { pageCheck } = useTaskActions()
		return { store, pageCheck }
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
		getCategories() {
			return this.store.getCategories
		},
		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},
		getPriorityNames() {
			return this.store.getPriorityNames
		},
		getTasksInCreatedOrder() {
			return this.store.getTasksInCreatedOrder
		},

		priorities() {
			return this.store.priorities
		}
	},

	methods: {
		addTask() {
			this.$refs.taskModalRef.show()
		},

		openScheduleSetUp() {
			if (this.store.schedule) {
				this.$router.push('/schedule')
			} else {
				this.$refs.scheduleSetUpModalRef.show()
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

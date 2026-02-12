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

			<!-- Loading state -->
			<div v-if="isLoading">
				<skeleton-loader :lines="2" height="4.5rem" />
				<div class="mt-6">
					<skeleton-loader :lines="1" height="1.2rem" />
					<div class="mt-4 flex justify-center">
						<skeleton-loader :lines="1" height="12rem" />
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="!hasTasks" class="py-8 text-gray-500 font-rajdhani">
				<p class="text-lg font-semibold">No tasks yet</p>
				<p class="text-sm">Add your first task to see your dashboard come to life.</p>
			</div>

			<!-- Data loaded -->
			<div v-else>
				<filter-widget
					title="Highest Priority Task"
					:tasks="highestPriorityTask"
					@editTask="openTaskModal()"
				/>
				<filter-widget
					title="Oldest Task"
					:tasks="oldestTask"
					@editTask="openTaskModal()"
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
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
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
		SkeletonLoader,
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
			chartOptions: {
				responsive: false,
				maintainAspectRatio: true
			}
		}
	},

	created() {
		this.pageCheck()
	},

	computed: {
		isLoading() {
			return this.store.isLoadingTasks
		},

		hasTasks() {
			return this.store.getPrioritisedTasks.length > 0
		},

		highestPriorityTask() {
			const tasks = this.store.getPrioritisedTasks
			return tasks.length > 0 ? [tasks[0]] : []
		},

		oldestTask() {
			const tasks = this.store.getTasksInCreatedOrder
			return tasks.length > 0 ? [tasks[0]] : []
		},

		getCategories() {
			return this.store.getCategories
		},

		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		getPriorityNames() {
			return this.store.getPriorityNames
		},

		priorities() {
			return this.store.priorities
		},

		categoryBreakdownData() {
			const labels = []
			const data = []
			const backgroundColor = []
			const palette = this.store.categoryPalette

			this.getCategories.forEach((category, index) => {
				labels.push(category)
				const tasksInCategory = this.getPrioritisedTasks.filter(
					x => x.category == category
				)
				data.push(tasksInCategory.length)
				backgroundColor.push(palette[index % palette.length])
			})

			return {
				labels,
				datasets: [{ data, backgroundColor }]
			}
		},

		priorityBreakdownData() {
			const labels = []
			const data = []
			const backgroundColor = []

			this.getPriorityNames.forEach(priority => {
				labels.push(priority)
				const tasksInPriority = this.getPrioritisedTasks.filter(
					x => x.priority == this.priorities[priority].value
				)
				data.push(tasksInPriority.length)
				backgroundColor.push(this.priorities[priority].color)
			})

			return {
				labels,
				datasets: [{ data, backgroundColor }]
			}
		}
	},

	methods: {
		addTask() {
			this.$refs.taskModalRef.show()
		},

		openTaskModal() {
			this.$refs.taskModalRef.show()
		},

		openScheduleSetUp() {
			if (this.store.schedule) {
				this.$router.push('/schedule')
			} else {
				this.$refs.scheduleSetUpModalRef.show()
			}
		}
	}
}
</script>

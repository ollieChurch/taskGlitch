<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
		<content-card>
			<!-- Command Center Header -->
			<h1 class="text-left mb-2 font-rajdhani font-bold text-sm text-text-heading section-header uppercase tracking-widest shrink-0">Command Center</h1>
			<hr class="accent-divider mb-4 mt-2 shrink-0" />

			<!-- Loading state -->
			<div v-if="isLoading">
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<skeleton-loader v-for="n in 4" :key="n" :lines="1" height="4rem" />
				</div>
				<skeleton-loader :lines="2" height="4.5rem" />
				<div class="mt-6">
					<skeleton-loader :lines="1" height="1.2rem" />
					<div class="mt-4 flex justify-center">
						<skeleton-loader :lines="1" height="12rem" />
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="!hasTasks" class="py-8 text-text-secondary font-rajdhani">
				<p class="text-lg font-semibold">No tasks yet</p>
				<p class="text-sm">Add your first task to see your dashboard come to life.</p>
			</div>

			<!-- Data loaded -->
			<div v-else class="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
				<!-- Stat Counters — full width row -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<!-- Active Tasks -->
					<div class="stat-counter depth-panel border border-border-visible rounded-lg p-3 text-center">
						<ListTodo :size="18" class="mx-auto mb-1 text-accent" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ activeTaskCount }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Active
						</p>
					</div>

					<!-- Completed Tasks -->
					<div class="stat-counter depth-panel border border-border-visible rounded-lg p-3 text-center">
						<CheckCircle2 :size="18" class="mx-auto mb-1 text-app-success" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ completedTaskCount }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Completed
						</p>
					</div>

					<!-- Categories -->
					<div class="stat-counter depth-panel border border-border-visible rounded-lg p-3 text-center">
						<FolderOpen :size="18" class="mx-auto mb-1 text-app-info" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ categoryCount }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Categories
						</p>
					</div>

					<!-- Schedule Status -->
					<div class="stat-counter depth-panel border border-border-visible rounded-lg p-3 text-center">
						<Radio
							:size="18"
							class="mx-auto mb-1"
							:class="scheduleStatus.active ? 'text-app-success animate-pulse' : 'text-text-secondary'"
						/>
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ scheduleStatus.label }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Schedule
						</p>
					</div>
				</div>

				<!-- 2-column layout: spotlights + charts -->
				<div class="md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-5">
					<!-- Left column: spotlights, accuracy -->
					<div class="lg:col-span-3">
						<!-- Spotlight: Recommended Task -->
						<div v-if="highestPriorityTask.length" class="mb-4">
							<div class="spotlight-label flex items-center gap-2 mb-1 pl-3">
								<Crosshair :size="12" class="text-accent" />
								<span class="font-bold font-rajdhani text-xs text-accent uppercase tracking-widest">
									Recommended
								</span>
							</div>
							<task-card
								:task="highestPriorityTask[0]"
								@editTask="openTaskModal()"
								class="!mt-0"
							/>
						</div>

						<!-- Spotlight: Oldest Task -->
						<div v-if="oldestTask.length" class="mb-4">
							<div class="spotlight-label flex items-center gap-2 mb-1 pl-3">
								<Clock :size="12" class="text-app-warning" />
								<span class="font-bold font-rajdhani text-xs text-app-warning uppercase tracking-widest">
									Oldest Task
								</span>
							</div>
							<task-card
								:task="oldestTask[0]"
								@editTask="openTaskModal()"
								class="!mt-0"
							/>
						</div>

						<!-- Estimation accuracy (only shown when time-tracked data exists) -->
						<div v-if="estimationAccuracy" class="depth-panel hover-glow mb-4 overflow-hidden rounded-lg border border-border-visible">
							<div class="flex items-stretch">
								<div class="flex items-center justify-center px-5 py-4" :class="estimationAccuracy.bgClass">
									<span class="text-3xl font-rajdhani font-bold text-white leading-none">{{ estimationAccuracy.percentage }}%</span>
								</div>
								<div class="flex-1 px-4 py-3 text-left">
									<div class="flex items-center gap-2">
										<h5 class="font-bold font-rajdhani text-xs uppercase tracking-widest">Estimation Accuracy</h5>
										<span class="text-xs text-text-secondary font-rajdhani">{{ estimationAccuracy.taskCount }} task{{ estimationAccuracy.taskCount === 1 ? '' : 's' }}</span>
									</div>
									<p class="text-sm text-text-secondary font-rajdhani mt-1 mb-0">
										{{ estimationAccuracy.summary }}
									</p>
								</div>
							</div>
						</div>
					</div><!-- /left column -->

					<!-- Right column: charts -->
					<div class="lg:col-span-2">
						<h5 class="text-start mb-3 font-bold font-rajdhani text-sm text-text-heading section-header uppercase tracking-widest">
							Backlog Breakdown
						</h5>
						<div class="depth-panel depth-highlight rounded-lg border border-border-visible">
							<BaseTabs fill>
								<BaseTab title="Categories">
									<div class="pt-4 pb-6 px-4">
										<div class="max-w-[320px] mx-auto">
											<doughnut
												:data="categoryBreakdownData"
												:options="chartOptions"
											/>
										</div>
									</div>
								</BaseTab>
								<BaseTab title="Priorities">
									<div class="pt-4 pb-6 px-4">
										<div class="max-w-[320px] mx-auto">
											<doughnut
												:data="priorityBreakdownData"
												:options="chartOptions"
											/>
										</div>
									</div>
								</BaseTab>
							</BaseTabs>
						</div>
					</div><!-- /right column -->
				</div><!-- /grid -->
			</div>
		</content-card>
		<task-modal ref="taskModalRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'
import { ListTodo, CheckCircle2, FolderOpen, Radio, Crosshair, Clock } from 'lucide-vue-next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
	name: 'DashboardView',

	components: {
		ContentCard,
		TaskCard,
		TaskModal,
		Doughnut,
		SkeletonLoader,
		BaseTabs,
		BaseTab,
		ListTodo,
		CheckCircle2,
		FolderOpen,
		Radio,
		Crosshair,
		Clock
	},

	setup() {
		const store = useAppStore()
		const { pageCheck } = useTaskActions()
		return { store, pageCheck }
	},

	data() {
		return {
			chartOptions: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							color: '#94a3b8',
							font: {
								family: 'Rajdhani',
								size: 12
							},
							padding: 12,
							usePointStyle: true,
							pointStyleWidth: 10
						}
					},
					tooltip: {
						backgroundColor: '#1a2332',
						titleColor: '#f1f5f9',
						bodyColor: '#e2e8f0',
						borderColor: '#1e293b',
						borderWidth: 1,
						titleFont: {
							family: 'Rajdhani',
							weight: 'bold'
						},
						bodyFont: {
							family: 'Rajdhani'
						}
					}
				}
			}
		}
	},

	created() {
		this.pageCheck()
	},

	watch: {
		'store.addTaskTrigger'() {
			this.addTask()
		}
	},

	computed: {
		isLoading() {
			return this.store.isLoadingTasks
		},

		hasTasks() {
			return this.store.getPrioritisedTasks.length > 0
		},

		activeTaskCount() {
			return this.store.getPrioritisedTasks.length
		},

		completedTaskCount() {
			return this.store.completed.length
		},

		categoryCount() {
			return this.store.getCategories.length
		},

		scheduleStatus() {
			if (this.store.schedule && this.store.schedule.tasks) {
				return { label: 'Active', active: true }
			}
			return { label: 'None', active: false }
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

		estimationAccuracy() {
			const tracked = this.store.completed.filter(
				t => t.actualDuration != null && t.sizing != null && t.sizing > 0
			)
			if (tracked.length === 0) return null

			const totalEstimated = tracked.reduce((sum, t) => sum + t.sizing, 0)
			const totalActual = tracked.reduce((sum, t) => sum + t.actualDuration, 0)

			// Accuracy as percentage — 100% means perfect, >100 means underestimating, <100 means overestimating
			const ratio = totalActual / totalEstimated
			const percentage = Math.round((1 - Math.abs(1 - ratio)) * 100)

			let summary, bgClass
			if (ratio > 1.1) {
				const overMins = totalActual - totalEstimated
				summary = `You tend to underestimate — tasks took ${overMins}m longer than expected`
				bgClass = 'bg-app-warning'
			} else if (ratio < 0.9) {
				const underMins = totalEstimated - totalActual
				summary = `You tend to overestimate — tasks took ${underMins}m less than expected`
				bgClass = 'bg-app-info'
			} else {
				summary = 'Your estimates are close to reality — nice work'
				bgClass = 'bg-app-success'
			}

			return { percentage: Math.max(0, percentage), taskCount: tracked.length, summary, bgClass }
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
				labels.push(priority.charAt(0).toUpperCase() + priority.slice(1))
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
		}
	}
}
</script>

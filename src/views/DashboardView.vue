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
					<router-link :to="{ name: 'tasks', query: { tab: 'backlog' } }" class="stat-counter stat-counter-link depth-panel border border-border-visible rounded-lg p-3 text-center block">
						<ListTodo :size="18" class="mx-auto mb-1 text-accent" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ activeTaskCount }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Active
						</p>
					</router-link>

					<!-- Completed Tasks (last 7 days) -->
					<router-link :to="{ name: 'tasks', query: { tab: 'completed' } }" class="stat-counter stat-counter-link depth-panel border border-border-visible rounded-lg p-3 text-center block">
						<CheckCircle2 :size="18" class="mx-auto mb-1 text-app-success" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ completedLast7Days }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Done This Week
						</p>
					</router-link>

					<!-- Categories -->
					<button @click="scrollToBreakdown" class="stat-counter stat-counter-link depth-panel border border-border-visible rounded-lg p-3 text-center block w-full">
						<FolderOpen :size="18" class="mx-auto mb-1 text-app-info" />
						<p class="text-2xl font-rajdhani font-bold text-text-heading leading-none mb-1">
							{{ categoryCount }}
						</p>
						<p class="text-xs font-rajdhani text-text-secondary uppercase tracking-wider">
							Categories
						</p>
					</button>

					<!-- Schedule Status -->
					<router-link :to="{ name: 'schedule' }" class="stat-counter stat-counter-link depth-panel border border-border-visible rounded-lg p-3 text-center block">
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
					</router-link>
				</div>

				<!-- Spotlights — side by side on desktop -->
				<div class="md:grid md:grid-cols-2 md:gap-4 mb-4">
					<div v-if="highestPriorityTask.length">
						<div class="spotlight-label flex items-center gap-2 mb-1 pl-3">
							<Crosshair :size="12" class="text-accent" />
							<span class="font-bold font-rajdhani text-xs text-accent uppercase tracking-widest">
								Recommended
							</span>
						</div>
						<task-card
							:task="highestPriorityTask[0]"
							@openDetail="openTaskDetail"
							class="!mt-0"
						/>
					</div>

					<div v-if="oldestTask.length">
						<div class="spotlight-label flex items-center gap-2 mb-1 pl-3">
							<Clock :size="12" class="text-app-warning" />
							<span class="font-bold font-rajdhani text-xs text-app-warning uppercase tracking-widest">
								Oldest Task
							</span>
						</div>
						<task-card
							:task="oldestTask[0]"
							@openDetail="openTaskDetail"
							class="!mt-0"
						/>
					</div>
				</div>

				<!-- Estimation accuracy — full width -->
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

				<!-- Breakdowns — side by side on desktop -->
				<div ref="breakdownRef" class="md:grid md:grid-cols-2 md:gap-4">
					<!-- Priority Breakdown -->
					<div class="mb-4 md:mb-0">
						<h5 class="text-start mb-2 font-bold font-rajdhani text-xs text-text-heading uppercase tracking-widest">
							By Priority
						</h5>
						<div class="depth-panel depth-highlight rounded-lg border border-border-visible p-3">
							<router-link
								v-for="item in priorityBreakdown"
								:key="item.label"
								:to="{ name: 'tasks', query: { tab: 'backlog', priority: item.value } }"
								class="breakdown-row group flex items-center gap-3 py-1.5"
							>
								<span class="text-xs font-rajdhani font-semibold text-text-secondary w-16 text-left truncate shrink-0 group-hover:text-text-heading transition-colors">{{ item.label }}</span>
								<div class="flex-1 h-5 bg-surface-base rounded-sm overflow-hidden border border-border-visible/50">
									<div
										class="h-full rounded-sm transition-all duration-500 bar-glow"
										:style="{ width: item.percent + '%', backgroundColor: item.color }"
									/>
								</div>
								<span class="text-xs font-rajdhani font-bold text-text-heading w-6 text-right shrink-0">{{ item.count }}</span>
							</router-link>
						</div>
					</div>

					<!-- Category Breakdown -->
					<div>
						<h5 class="text-start mb-2 font-bold font-rajdhani text-xs text-text-heading uppercase tracking-widest">
							By Category
						</h5>
						<div class="depth-panel depth-highlight rounded-lg border border-border-visible p-3">
							<div v-if="categoryBreakdown.length === 0" class="py-3 text-center text-text-secondary font-rajdhani text-sm">
								No categories yet
							</div>
							<router-link
								v-for="item in categoryBreakdown"
								:key="item.label"
								:to="{ name: 'tasks', query: { tab: 'backlog', category: item.label } }"
								class="breakdown-row group flex items-center gap-3 py-1.5"
							>
								<span class="text-xs font-rajdhani font-semibold text-text-secondary w-16 text-left truncate shrink-0 group-hover:text-text-heading transition-colors">{{ item.label }}</span>
								<div class="flex-1 h-5 bg-surface-base rounded-sm overflow-hidden border border-border-visible/50">
									<div
										class="h-full rounded-sm transition-all duration-500 bar-glow"
										:style="{ width: item.percent + '%', backgroundColor: item.color }"
									/>
								</div>
								<span class="text-xs font-rajdhani font-bold text-text-heading w-6 text-right shrink-0">{{ item.count }}</span>
							</router-link>
						</div>
					</div>
				</div>
			</div>
		</content-card>
		<TaskDetailModal ref="taskDetailRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { ListTodo, CheckCircle2, FolderOpen, Radio, Crosshair, Clock } from 'lucide-vue-next'

export default {
	name: 'DashboardView',

	components: {
		ContentCard,
		TaskCard,
		TaskDetailModal,
		SkeletonLoader,
		ListTodo,
		CheckCircle2,
		FolderOpen,
		Radio,
		Crosshair,
		Clock
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, getActualBand } = useTaskActions()
		return { store, pageCheck, getActualBand }
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

		activeTaskCount() {
			return this.store.getPrioritisedTasks.length
		},

		completedLast7Days() {
			const sevenDaysAgo = new Date()
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
			sevenDaysAgo.setHours(0, 0, 0, 0)
			return this.store.completed.filter(t => {
				if (!t.completedDateTime) return false
				return new Date(t.completedDateTime) >= sevenDaysAgo
			}).length
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

		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		estimationAccuracy() {
			const tracked = this.store.completed.filter(
				t => t.actualDuration != null && t.sizing != null && t.sizing > 0
			)
			if (tracked.length === 0) return null

			const defaultBands = this.store.getAccountSettings.taskLength

			let correctCount = 0
			for (const task of tracked) {
				const bands = task.estimateBandsAtCompletion ?? defaultBands
				const actualBand = this.getActualBand(task.actualDuration, bands)
				if (actualBand === task.sizing) correctCount++
			}

			const percentage = Math.round((correctCount / tracked.length) * 100)

			let summary, bgClass
			if (percentage >= 70) {
				summary = `${correctCount} of ${tracked.length} tasks landed in the right size band — nice work`
				bgClass = 'bg-app-success'
			} else if (percentage >= 40) {
				summary = `Only ${correctCount} of ${tracked.length} tasks matched their size band — review your sizing`
				bgClass = 'bg-app-warning'
			} else {
				summary = `${correctCount} of ${tracked.length} tasks matched their size band — consider adjusting estimates`
				bgClass = 'bg-app-danger'
			}

			return { percentage, taskCount: tracked.length, summary, bgClass }
		},

		categoryBreakdown() {
			const categories = this.store.getCategories
			const tasks = this.getPrioritisedTasks
			const palette = this.store.categoryPalette
			const total = tasks.length || 1

			return categories.map((category, index) => {
				const count = tasks.filter(x => x.category === category).length
				return {
					label: category,
					count,
					percent: Math.round((count / total) * 100),
					color: palette[index % palette.length]
				}
			}).sort((a, b) => b.count - a.count)
		},

		priorityBreakdown() {
			const tasks = this.getPrioritisedTasks
			const total = tasks.length || 1

			return this.store.getPriorityNames.map(name => {
				const priority = this.store.priorities[name]
				const count = tasks.filter(x => x.priority === priority.value).length
				return {
					label: name.charAt(0).toUpperCase() + name.slice(1),
					value: priority.value,
					count,
					percent: Math.round((count / total) * 100),
					color: priority.color
				}
			})
		}
	},

	methods: {
		openTaskDetail(task) {
			this.$refs.taskDetailRef.show(task)
		},

		scrollToBreakdown() {
			this.$refs.breakdownRef?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}
}
</script>

<style scoped>
.stat-counter-link {
	text-decoration: none;
	cursor: pointer;
}

.breakdown-row {
	text-decoration: none;
}

.breakdown-row:hover .bar-glow {
	box-shadow: 0 0 8px currentColor;
	filter: brightness(1.2);
}

.bar-glow {
	transition: width 0.5s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
</style>

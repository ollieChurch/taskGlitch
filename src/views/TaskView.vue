<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
		<content-card>
			<BaseTabs pills fill sticky>
				<BaseTab title="Backlog">
					<div class="pt-2 md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
						<FilterWidget
							v-model:filters="backlogFilters"
							:categories="getCategories"
							:sizeLabels="store.sizeLabels"
							:priorities="store.priorities"
							:showDateRange="false"
						/>

						<!-- Blocked count -->
						<p v-if="blockedCount > 0 && !isLoadingTasks" class="text-xs font-rajdhani font-semibold text-app-warning mb-2">
							<Ban :size="12" class="inline mr-1" aria-hidden="true" />{{ blockedCount }} task{{ blockedCount === 1 ? '' : 's' }} blocked
						</p>

						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingTasks" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="getPrioritisedTasks.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">Your backlog is empty</p>
							<p class="text-sm">Add a task to get started with TaskGlitch.</p>
						</div>

						<!-- No results from filter -->
						<div v-else-if="filteredTasks.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">No tasks match your filters</p>
							<p class="text-sm">Try adjusting your search or filters.</p>
						</div>

						<!-- Tasks -->
						<template v-else>
							<p v-if="backlogActiveFilters > 0" class="text-xs text-text-secondary font-rajdhani mb-2">
								Showing {{ filteredTasks.length }} of {{ getPrioritisedTasks.length }} tasks
							</p>
							<TransitionGroup name="task-list" tag="div" class="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-4">
								<TaskCard
									v-for="task in filteredTasks"
									:key="`task-${task.id}`"
									:task="task"
									@openDetail="openTaskDetail"
									@taskCompleted="onTaskCompleted"
								/>
							</TransitionGroup>
						</template>
					</div>
				</BaseTab>
				<BaseTab title="Completed">
					<div class="pt-2 md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
						<FilterWidget
							v-model:filters="completedFilters"
							:categories="getCategories"
							:sizeLabels="store.sizeLabels"
							:priorities="store.priorities"
							:showDateRange="true"
						/>

						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingCompleted" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="completed.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">No completed tasks yet</p>
							<p class="text-sm">Tasks you complete will appear here.</p>
						</div>

						<!-- No results from filter -->
						<div v-else-if="filteredCompleted.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">No tasks match your filters</p>
							<p class="text-sm">Try adjusting your search or filters.</p>
						</div>

						<!-- Completed tasks -->
						<template v-else>
							<p v-if="completedActiveFilters > 0" class="text-xs text-text-secondary font-rajdhani mb-2">
								Showing {{ filteredCompleted.length }} of {{ completed.length }} tasks
							</p>
							<TransitionGroup name="task-list" tag="div" class="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-4">
								<TaskCard
									v-for="task in filteredCompleted"
									:key="`completed-${task.id}`"
									:task="task"
									@openDetail="openTaskDetail"
								/>
							</TransitionGroup>
						</template>
					</div>
				</BaseTab>
			</BaseTabs>
		</content-card>
		<TaskDetailModal ref="taskDetailRef" />
		<Toast
			:visible="toastVisible"
			:message="toastMessage"
			@action="undoComplete"
			@dismiss="dismissToast"
		/>
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskCard from '@/components/TaskCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'
import FilterWidget from '@/components/FilterWidget.vue'
import Toast from '@/components/ui/Toast.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import { Ban } from 'lucide-vue-next'

export default {
	name: 'TaskView',

	components: {
		ContentCard,
		TaskCard,
		TaskDetailModal,
		Ban,
		SkeletonLoader,
		BaseTabs,
		BaseTab,
		FilterWidget,
		Toast
	},

	setup() {
		const store = useAppStore()
		const { pageCheck, moveTask } = useTaskActions()
		return { store, pageCheck, moveTask }
	},

	created() {
		this.pageCheck()
	},

	data() {
		return {
			backlogFilters: {
				search: '',
				priorities: [],
				categories: [],
				sizes: [],
				blocked: '',
				deadline: ''
			},
			completedFilters: {
				search: '',
				priorities: [],
				categories: [],
				sizes: [],
				blocked: '',
				deadline: '',
				completedAfter: '',
				completedBefore: ''
			},
			toastVisible: false,
			toastTask: null,
			toastTimer: null
		}
	},

	watch: {},

	computed: {
		isLoadingTasks() {
			return this.store.isLoadingTasks
		},

		isLoadingCompleted() {
			return this.store.loading.completed
		},

		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},

		completed() {
			return this.store.completed
		},

		getCategories() {
			return this.store.getCategories
		},

		filteredTasks() {
			return this.applyFilters(this.getPrioritisedTasks, this.backlogFilters)
		},

		filteredCompleted() {
			return this.applyFilters(this.completed, this.completedFilters)
		},

		backlogActiveFilters() {
			return this.countActiveFilters(this.backlogFilters)
		},

		completedActiveFilters() {
			return this.countActiveFilters(this.completedFilters)
		},

		blockedCount() {
			return this.getPrioritisedTasks.filter(t => t.blocked).length
		},

		toastMessage() {
			return this.toastTask ? `"${this.toastTask.name}" completed` : 'Task completed'
		}
	},

	methods: {
		openTaskDetail(task) {
			this.$refs.taskDetailRef.show(task)
		},

		countActiveFilters(filters) {
			let count = 0
			if (filters.search) count++
			if (filters.priorities?.length) count++
			if (filters.categories?.length) count++
			if (filters.sizes?.length) count++
			if (filters.blocked) count++
			if (filters.deadline) count++
			if (filters.completedAfter) count++
			if (filters.completedBefore) count++
			return count
		},

		applyFilters(tasks, filters) {
			return tasks.filter(task => {
				// Search (matches name OR description)
				if (filters.search) {
					const q = filters.search.toLowerCase()
					const inName = task.name?.toLowerCase().includes(q)
					const inDesc = task.description?.toLowerCase().includes(q)
					if (!inName && !inDesc) return false
				}

				// Priority (OR within type)
				if (filters.priorities?.length > 0) {
					if (!filters.priorities.includes(task.priority)) return false
				}

				// Category (OR within type)
				if (filters.categories?.length > 0) {
					if (!filters.categories.includes(task.category)) return false
				}

				// Size (OR within type)
				if (filters.sizes?.length > 0) {
					if (!filters.sizes.includes(task.sizing)) return false
				}

				// Blocked status
				if (filters.blocked === 'active' && task.blocked) return false
				if (filters.blocked === 'blocked' && !task.blocked) return false

				// Deadline
				if (filters.deadline) {
					const now = new Date()
					const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
					if (filters.deadline === 'has' && !task.targetDateTime) return false
					if (filters.deadline === 'none' && task.targetDateTime) return false
					if (filters.deadline === 'overdue') {
						if (!task.targetDateTime || new Date(task.targetDateTime) >= now) return false
					}
					if (filters.deadline === 'this-week') {
						if (!task.targetDateTime) return false
						const dt = new Date(task.targetDateTime)
						if (dt < now || dt > weekFromNow) return false
					}
				}

				// Completed date range
				if (filters.completedAfter) {
					if (!task.completedDateTime) return false
					const taskDate = task.completedDateTime.substring(0, 10)
					if (taskDate < filters.completedAfter) return false
				}
				if (filters.completedBefore) {
					if (!task.completedDateTime) return false
					const taskDate = task.completedDateTime.substring(0, 10)
					if (taskDate > filters.completedBefore) return false
				}

				return true
			})
		},

		onTaskCompleted(task) {
			this.toastTask = { ...task }
			this.toastVisible = true
			clearTimeout(this.toastTimer)
			this.toastTimer = setTimeout(() => {
				this.dismissToast()
			}, 5000)
		},

		async undoComplete() {
			if (this.toastTask) {
				await this.moveTask(this.toastTask, 'tasks')
			}
			this.dismissToast()
		},

		dismissToast() {
			this.toastVisible = false
			clearTimeout(this.toastTimer)
			this.toastTimer = null
			this.toastTask = null
		}
	}
}
</script>

<style scoped>
.task-list-enter-active,
.task-list-leave-active {
	transition: opacity 0.25s ease;
}

.task-list-enter-from,
.task-list-leave-to {
	opacity: 0;
}
</style>

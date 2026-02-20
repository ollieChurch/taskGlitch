<template>
	<div class="md:flex md:flex-col md:h-full md:min-h-0">
		<content-card>
			<BaseTabs pills fill sticky>
				<BaseTab title="Backlog">
					<div class="pt-2 md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingTasks" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="getPrioritisedTasks.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">Your backlog is empty</p>
							<p class="text-sm">Add a task to get started with TaskGlitch.</p>
						</div>

						<!-- Tasks -->
						<div v-else class="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-4">
							<TaskCard
								v-for="task in getPrioritisedTasks"
								:key="`task-${task.id}`"
								:task="task"
								@editTask="openTaskModal()"
							/>
						</div>
					</div>
				</BaseTab>
				<BaseTab title="Completed">
					<div class="pt-2 md:flex-1 md:min-h-0 md:overflow-y-auto scroll-panel">
						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingCompleted" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="completed.length === 0" class="py-8 text-text-secondary font-rajdhani text-center">
							<p class="text-lg font-semibold">No completed tasks yet</p>
							<p class="text-sm">Tasks you complete will appear here.</p>
						</div>

						<!-- Completed tasks -->
						<div v-else class="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-4">
							<TaskCard
								v-for="task in completed"
								:key="`completed-${task.id}`"
								:task="task"
								@editTask="openTaskModal()"
							/>
						</div>
					</div>
				</BaseTab>
			</BaseTabs>
		</content-card>
		<task-modal ref="taskModalRef" />
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import ContentCard from '@/components/ContentCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import TaskCard from '@/components/TaskCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'

export default {
	name: 'TaskView',

	components: {
		ContentCard,
		TaskModal,
		TaskCard,
		SkeletonLoader,
		BaseTabs,
		BaseTab
	},

	setup() {
		const store = useAppStore()
		const { pageCheck } = useTaskActions()
		return { store, pageCheck }
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
		}
	},

	methods: {
		openTaskModal() {
			this.$refs.taskModalRef.show()
		},

		addTask() {
			this.$refs.taskModalRef.show()
		}
	}
}
</script>

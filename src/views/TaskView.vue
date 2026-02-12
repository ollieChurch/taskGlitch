<template>
	<div>
		<content-card>
			<div class="flex items-center justify-between mb-3">
				<h1 class="text-left mb-0 font-rajdhani font-bold text-2xl">Tasks</h1>
				<button
					class="bg-blue-600 text-white px-4 py-2 rounded font-rajdhani font-semibold hover:bg-blue-700"
					@click="addTask()"
				>
					Add Task
				</button>
			</div>
			<BaseTabs pills fill class="pt-2">
				<BaseTab title="Backlog">
					<div class="pt-2">
						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingTasks" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="getPrioritisedTasks.length === 0" class="py-8 text-gray-500 font-rajdhani text-center">
							<p class="text-lg font-semibold">Your backlog is empty</p>
							<p class="text-sm">Add a task to get started with TaskGlitch.</p>
						</div>

						<!-- Tasks -->
						<template v-else>
							<TaskCard
								v-for="task in getPrioritisedTasks"
								:key="`task-${task.id}`"
								:task="task"
								@editTask="openTaskModal()"
							/>
						</template>
					</div>
				</BaseTab>
				<BaseTab title="Completed">
					<div class="pt-2">
						<!-- Loading state -->
						<skeleton-loader v-if="isLoadingCompleted" :lines="4" height="4.5rem" />

						<!-- Empty state -->
						<div v-else-if="completed.length === 0" class="py-8 text-gray-500 font-rajdhani text-center">
							<p class="text-lg font-semibold">No completed tasks yet</p>
							<p class="text-sm">Tasks you complete will appear here.</p>
						</div>

						<!-- Completed tasks -->
						<template v-else>
							<TaskCard
								v-for="task in completed"
								:key="`completed-${task.id}`"
								:task="task"
								@editTask="openTaskModal()"
							/>
						</template>
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

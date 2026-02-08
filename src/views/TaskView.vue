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
						<TaskCard
							v-for="task in getPrioritisedTasks"
							:key="`task-${task.id}`"
							:task="task"
							@editTask="openTaskModal()"
						/>
					</div>
				</BaseTab>
				<BaseTab title="Completed">
					<div class="pt-2">
						<TaskCard
							v-for="task in completed"
							:key="`completed-${task.id}`"
							:task="task"
							@editTask="openTaskModal()"
						/>
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
import BaseTabs from '@/components/ui/BaseTabs.vue'
import BaseTab from '@/components/ui/BaseTab.vue'

export default {
	name: 'TaskView',

	components: {
		ContentCard,
		TaskModal,
		TaskCard,
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

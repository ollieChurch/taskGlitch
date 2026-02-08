<template>
	<div class="mt-4 mb-3 py-2 pl-5 pr-4 bg-white rounded-lg shadow-sm border relative task-card overflow-visible">
		<div
			class="priority-icon text-center text-white"
			:style="{ backgroundColor: task.completedDateTime ? '#1a8754' : priorityIcons[task.priority].hex }"
		>
			<i
				:class="`fas fa-lg ${
					task.completedDateTime
						? 'fa-check-circle'
						: priorityIcons[task.priority].icon
				}`"
			></i>
		</div>
		<div class="flex items-center">
			<div class="w-10/12 pr-4">
				<h5
					:class="`text-left mb-1 font-rajdhani font-semibold ${
						task.completedDateTime
							? 'line-through opacity-75'
							: ''
					}`"
				>
					{{ task.name }}
					<span v-if="debug"> - {{ task.score }}</span>
				</h5>
				<div v-if="task.completedDateTime" class="flex flex-wrap task-details opacity-75 text-sm">
					<a
						class="sm:w-auto text-left cursor-pointer mr-3"
						@click="editTask(task)"
					>
						<i class="fas fa-edit"></i>
					</a>
					<p class="sm:w-auto text-left mb-0">
						<i class="fas fa-check-circle"></i>
						{{
							new Date(task.completedDateTime).toLocaleDateString(
								'en-uk',
								{
									day: 'numeric',
									year: 'numeric',
									month: 'short'
								}
							)
						}}
					</p>
				</div>
				<div v-else class="flex flex-wrap task-details text-sm">
					<a
						class="sm:w-auto text-left mb-0 cursor-pointer mr-3"
						@click="editTask(task)"
					>
						<i class="fas fa-edit"></i>
					</a>
					<p class="sm:w-auto text-left mb-0 mr-3">
						<i class="fas fa-stopwatch"></i>
						{{ task.sizing }} mins
					</p>
					<p
						class="sm:flex-1 text-left mb-0"
						v-if="task.targetDateTime"
					>
						<i
							:class="`fas ${
								task.isHardDeadline
									? 'fa-exclamation-circle'
									: 'fa-bullseye'
							}`"
						></i>
						{{
							new Date(task.targetDateTime).toLocaleDateString(
								'en-uk',
								{
									day: 'numeric',
									year: 'numeric',
									month: 'short'
								}
							)
						}}
					</p>
				</div>
			</div>
			<div class="w-2/12">
				<button
					class="complete-btn bg-gray-100 border rounded hover:bg-gray-200"
					@click="handleMainAction(task)"
				>
					<i
						:class="`fas ${
							task.completedDateTime
								? 'fa-undo'
								: 'fa-check-circle'
						}`"
					></i>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'

export default {
	props: ['task'],
	emits: ['editTask'],

	setup() {
		const store = useAppStore()
		const { moveTask, rescoreActiveBacklog } = useTaskActions()
		return { store, moveTask, rescoreActiveBacklog }
	},

	data() {
		return {
			priorityIcons: [
				{ icon: 'fa-fire', hex: '#dc3546' },
				{ icon: 'fa-thermometer-three-quarters', hex: '#ffc107' },
				{ icon: 'fa-thermometer-half', hex: '#1a8754' },
				{ icon: 'fa-thermometer-quarter', hex: '#10caf0' }
			]
		}
	},

	computed: {
		debug() {
			return this.store.debug
		}
	},

	methods: {
		editTask(task) {
			this.store.setTaskToPatch(task)
			this.$emit('editTask')
		},

		handleMainAction(task) {
			const moveTo = task.completedDateTime ? 'tasks' : 'completed'
			this.moveTask(task, moveTo)
		}
	}
}
</script>

<style scoped>
.task-card {
	position: relative;
}

.complete-btn {
	width: 50px;
	text-align: center;
	aspect-ratio: 1;
	padding: 0;
}

.task-details {
	width: 100%;
}

.priority-icon {
	position: absolute;
	top: -7px;
	left: -7px;
	aspect-ratio: 1;
	width: 40px;
	padding-top: 0.5em;
	border-top-left-radius: 5px;
	border-bottom-right-radius: 5px;
}
</style>

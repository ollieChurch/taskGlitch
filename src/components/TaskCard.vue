<template>
	<div class="task-card mt-3 mb-2 py-2 pl-4 pr-4 depth-panel relative overflow-hidden hover-glow"
	>
		<div
			class="task-priority-bar"
			:style="{ backgroundColor: categoryColor }"
		></div>
		<div class="flex items-center">
			<div class="flex-1 min-w-0 pr-4">
				<h5
					:class="`text-left mb-1 font-rajdhani font-semibold text-text-heading ${
						task.completedDateTime
							? 'line-through opacity-60'
							: ''
					}`"
				>
					<span v-if="!task.completedDateTime" class="inline-flex items-center mr-1 align-middle">
						<Zap v-if="task.priority === 0" :size="14" :style="{ color: priorityIcons[0].hex }" />
						<ArrowUp v-else-if="task.priority === 1" :size="14" :style="{ color: priorityIcons[1].hex }" />
						<Minus v-else-if="task.priority === 2" :size="14" :style="{ color: priorityIcons[2].hex }" />
						<ArrowDown v-else :size="14" :style="{ color: priorityIcons[3].hex }" />
					</span>
					{{ task.name }}
					<span v-if="isDev && debug"> - {{ task.score }}</span>
				</h5>
				<div v-if="task.completedDateTime" class="flex flex-wrap task-details opacity-60 text-sm text-text-secondary">
					<a
						class="sm:w-auto text-left cursor-pointer mr-3 hover:text-accent transition-colors"
						:aria-label="`Edit task: ${task.name}`"
						role="button"
						tabindex="0"
						@click="editTask(task)"
						@keydown.enter="editTask(task)"
					>
						<Pencil :size="14" class="inline" aria-hidden="true" />
					</a>
					<p class="sm:w-auto text-left mb-0">
						<CheckCircle2 :size="14" class="inline" />
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
				<div v-else class="flex flex-wrap task-details text-sm text-text-secondary">
					<a
						class="sm:w-auto text-left mb-0 cursor-pointer mr-3 hover:text-accent transition-colors"
						:aria-label="`Edit task: ${task.name}`"
						role="button"
						tabindex="0"
						@click="editTask(task)"
						@keydown.enter="editTask(task)"
					>
						<Pencil :size="14" class="inline" aria-hidden="true" />
					</a>
					<p class="sm:w-auto text-left mb-0 mr-3">
						<Timer :size="14" class="inline" />
						{{ store.getSizeLabel(task.sizing) }}
					</p>
					<p
						class="sm:flex-1 text-left mb-0"
						v-if="task.targetDateTime"
					>
						<AlertCircle v-if="task.isHardDeadline" :size="14" class="inline" />
						<Target v-else :size="14" class="inline" />
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
			<div class="shrink-0">
				<button
					class="complete-btn btn-themed bg-surface-hover border border-border-default hover:bg-accent hover:text-text-inverse hover:border-accent text-text-secondary transition-all"
					:aria-label="task.completedDateTime ? `Move '${task.name}' back to backlog` : `Mark '${task.name}' as complete`"
					@click="handleMainAction(task)"
				>
					<Undo2 v-if="task.completedDateTime" :size="18" aria-hidden="true" />
					<CheckCircle2 v-else :size="18" aria-hidden="true" />
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { markRaw } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { Zap, ArrowUp, Minus, ArrowDown, CheckCircle2, Pencil, Timer, AlertCircle, Target, Undo2 } from 'lucide-vue-next'

export default {
	props: ['task'],
	emits: ['editTask', 'taskCompleted'],
	components: { Zap, ArrowUp, Minus, ArrowDown, CheckCircle2, Pencil, Timer, AlertCircle, Target, Undo2 },

	setup() {
		const store = useAppStore()
		const { moveTask, rescoreActiveBacklog, removeTaskFromSchedule } = useTaskActions()
		return { store, moveTask, rescoreActiveBacklog, removeTaskFromSchedule }
	},

	data() {
		return {
			priorityIcons: [
				{ icon: markRaw(Zap), hex: '#dc3546' },
				{ icon: markRaw(ArrowUp), hex: '#ffc107' },
				{ icon: markRaw(Minus), hex: '#1a8754' },
				{ icon: markRaw(ArrowDown), hex: '#a78bfa' }
			]
		}
	},

	computed: {
		debug() {
			return this.store.debug
		},

		isDev() {
			return import.meta.env.DEV
		},

		categoryColor() {
			const categories = this.store.getCategories
			const palette = this.store.categoryPalette
			const idx = categories.indexOf(this.task.category)
			if (idx >= 0) {
				return palette[idx % palette.length]
			}
			return 'var(--color-accent-dim)'
		}
	},

	methods: {
		editTask(task) {
			this.store.setTaskToPatch(task)
			this.$emit('editTask')
		},

		async handleMainAction(task) {
			const moveTo = task.completedDateTime ? 'tasks' : 'completed'
			if (moveTo === 'completed') {
				this.$emit('taskCompleted', { ...task })
				await this.removeTaskFromSchedule(task.id)
			}
			this.moveTask(task, moveTo)
		}
	}
}
</script>

<style scoped>
.task-card {
	position: relative;
	border: 1px solid var(--color-border-visible);
	border-radius: var(--radius-card-sm);
}

.complete-btn {
	width: 50px;
	aspect-ratio: 1;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.task-details {
	width: 100%;
}

.task-priority-bar {
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
}
</style>

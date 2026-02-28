<template>
	<BaseModal ref="modalRef" :showDefaultFooter="false" size="md" @hide="onHide">
		<template #header>
			<div class="flex items-center gap-2 min-w-0">
				<span class="shrink-0">
					<Ban v-if="task && isEffectivelyBlocked" :size="16" class="text-app-warning" />
					<Zap v-else-if="task && task.priority === 0" :size="16" style="color: #dc3546" />
					<ArrowUp v-else-if="task && task.priority === 1" :size="16" style="color: #ffc107" />
					<Minus v-else-if="task && task.priority === 2" :size="16" style="color: #1a8754" />
					<ArrowDown v-else-if="task" :size="16" style="color: #a78bfa" />
				</span>
				<h5 class="text-lg font-rajdhani font-semibold text-text-heading truncate">{{ task && task.name }}</h5>
			</div>
		</template>

		<template v-if="task">
			<!-- Details -->
			<dl class="font-rajdhani text-sm space-y-1.5 text-left">
				<div class="flex gap-3" v-if="task.category">
					<dt class="text-text-secondary w-20 shrink-0">Category</dt>
					<dd class="text-text-primary">{{ task.category }}</dd>
				</div>
				<div class="flex gap-3">
					<dt class="text-text-secondary w-20 shrink-0">Size</dt>
					<dd class="text-text-primary">{{ store.getSizeLabel(task.sizing) }}</dd>
				</div>
				<div class="flex gap-3">
					<dt class="text-text-secondary w-20 shrink-0">Priority</dt>
					<dd class="text-text-primary capitalize">{{ priorityLabel }}</dd>
				</div>
				<div class="flex gap-3" v-if="task.targetDateTime">
					<dt class="text-text-secondary w-20 shrink-0">Deadline</dt>
					<dd class="text-text-primary">
						{{ formatDate(task.targetDateTime) }}
						<span v-if="task.isHardDeadline" class="text-app-danger text-xs ml-1 font-semibold">Hard</span>
					</dd>
				</div>
				<div class="flex gap-3" v-if="task.completedDateTime">
					<dt class="text-text-secondary w-20 shrink-0">Completed</dt>
					<dd class="text-text-primary">{{ formatDate(task.completedDateTime) }}</dd>
				</div>
			</dl>

			<!-- Blocked reason (existing blocked task) -->
			<div v-if="task.blocked" class="mt-3 px-3 py-2 border border-app-warning bg-app-warning/10 font-rajdhani flex items-center gap-2 text-left" style="border-radius: var(--radius-btn);">
				<Ban :size="14" class="text-app-warning shrink-0" aria-hidden="true" />
				<span class="text-sm text-app-warning">{{ task.blockedReason || 'Blocked' }}</span>
			</div>

			<!-- Dep-blocked reason -->
			<div v-else-if="isDepBlocked" class="mt-3 px-3 py-2 border border-app-warning bg-app-warning/10 font-rajdhani flex items-center gap-2 text-left" style="border-radius: var(--radius-btn);">
				<Ban :size="14" class="text-app-warning shrink-0" aria-hidden="true" />
				<span class="text-sm text-app-warning">Blocked by: {{ blockedByNames.join(', ') }}</span>
			</div>

			<!-- Blocking reason input (shown when user clicks Blocked on an unblocked task) -->
			<div v-if="awaitingReason" class="mt-3 text-left">
				<label class="block text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5">
					Reason <span class="normal-case">(optional)</span>
				</label>
				<input
					ref="reasonInput"
					v-model="blockReason"
					type="text"
					placeholder="e.g. Waiting on client response"
					class="w-full px-3 py-2 text-sm font-rajdhani bg-surface-base border border-border-visible text-text-primary placeholder-text-secondary focus:border-app-warning focus:outline-none"
					style="border-radius: var(--radius-btn);"
					@keydown.enter="confirmBlock"
					@keydown.escape="cancelBlock"
				/>
				<div class="flex gap-2 mt-2">
					<button
						@click="confirmBlock"
						class="btn-themed flex-1 bg-app-warning/20 border border-app-warning text-app-warning hover:bg-app-warning hover:text-text-inverse font-rajdhani font-semibold py-1.5 text-sm transition-all"
					>
						Confirm
					</button>
					<button
						@click="cancelBlock"
						class="btn-themed flex-1 bg-surface-hover border border-border-default text-text-secondary hover:border-accent-dim font-rajdhani font-semibold py-1.5 text-sm transition-all"
					>
						Cancel
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div v-if="!task.completedDateTime && !awaitingReason" class="flex gap-2 mt-4">
				<button
					@click="handleEdit"
					class="btn-themed flex-1 bg-surface-hover border border-border-default text-text-secondary hover:border-accent-dim hover:text-text-heading font-rajdhani font-semibold py-2 transition-all"
				>
					<Pencil :size="14" class="inline mr-1" aria-hidden="true" />Edit
				</button>
				<button
					@click="handleBlockButton"
					class="btn-themed flex-1 border font-rajdhani font-semibold py-2 transition-all"
					:class="isEffectivelyBlocked
						? 'bg-app-warning/20 border-app-warning text-app-warning hover:bg-app-warning hover:text-text-inverse hover:border-app-warning'
						: 'bg-surface-hover border-border-default text-text-secondary hover:bg-app-warning/20 hover:text-app-warning hover:border-app-warning'"
				>
					<Ban :size="14" class="inline mr-1" aria-hidden="true" />{{ isEffectivelyBlocked ? 'Unblocked' : 'Blocked' }}
				</button>
			</div>
			<div v-else-if="task.completedDateTime" class="mt-4">
				<button
					@click="handleEdit"
					class="btn-themed w-full bg-surface-hover border border-border-default text-text-secondary hover:border-accent-dim hover:text-text-heading font-rajdhani font-semibold py-2 transition-all"
				>
					<Pencil :size="14" class="inline mr-1" aria-hidden="true" />Edit
				</button>
			</div>
		</template>
	</BaseModal>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import BaseModal from './ui/BaseModal.vue'
import { Ban, Pencil, Zap, ArrowUp, Minus, ArrowDown } from 'lucide-vue-next'

export default {
	name: 'TaskDetailModal',
	components: { BaseModal, Ban, Pencil, Zap, ArrowUp, Minus, ArrowDown },

	setup() {
		const store = useAppStore()
		const { toggleBlockTask, clearTaskDependencies } = useTaskActions()
		return { store, toggleBlockTask, clearTaskDependencies }
	},

	data() {
		return {
			task: null,
			awaitingReason: false,
			blockReason: ''
		}
	},

	computed: {
		priorityLabel() {
			if (!this.task) return ''
			const map = { 0: 'critical', 1: 'high', 2: 'medium', 3: 'low' }
			return map[this.task.priority] ?? ''
		},

		depBlockedIds() {
			return this.store.getDependencyBlockedIds
		},

		isDepBlocked() {
			return !!(this.task && this.depBlockedIds.has(this.task.id))
		},

		isEffectivelyBlocked() {
			return !!(this.task && (this.task.blocked || this.isDepBlocked))
		},

		blockedByNames() {
			if (!this.task?.dependsOn?.length) return []
			const completedIds = new Set(this.store.completed.map(t => t.id))
			return this.task.dependsOn
				.filter(id => !completedIds.has(id))
				.map(id => this.store.getPrioritisedTasks.find(t => t.id === id)?.name ?? 'Unknown task')
		}
	},

	methods: {
		show(task) {
			this.task = { ...task }
			this.awaitingReason = false
			this.blockReason = ''
			this.$refs.modalRef.show()
		},

		onHide() {
			this.task = null
			this.awaitingReason = false
			this.blockReason = ''
		},

		formatDate(dt) {
			return new Date(dt).toLocaleDateString('en-uk', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		},

		handleEdit() {
			this.store.setTaskToPatch(this.task)
			this.$refs.modalRef.close()
			this.store.triggerAddTask()
		},

		handleBlockButton() {
			if (this.task.blocked) {
				// Unblock manually-blocked task immediately
				this.doToggleBlock(null)
			} else if (this.isDepBlocked) {
				// Remove the dependency to unblock dep-blocked task
				this.doClearDependencies()
			} else {
				// Show reason input before blocking
				this.awaitingReason = true
				this.$nextTick(() => this.$refs.reasonInput?.focus())
			}
		},

		async confirmBlock() {
			await this.doToggleBlock(this.blockReason.trim() || null)
		},

		cancelBlock() {
			this.awaitingReason = false
			this.blockReason = ''
		},

		async doToggleBlock(reason) {
			await this.toggleBlockTask(this.task, reason)
			this.$refs.modalRef.close()
		},

		async doClearDependencies() {
			await this.clearTaskDependencies(this.task)
			this.$refs.modalRef.close()
		}
	},

	expose: ['show']
}
</script>

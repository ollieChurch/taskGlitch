<template>
	<BaseModal
		ref="modalRef"
		@show="resetModal"
		@ok="handleOk"
		@hide="clearTaskToPatch"
		:hideHeaderClose="true"
		:showDefaultFooter="true"
	>
		<template #header>
			<h5 class="text-lg font-rajdhani font-semibold text-text-heading">
				{{ taskToPatch.id ? 'Edit' : 'Add' }} A Task
			</h5>
			<button
				v-if="taskToPatch.id"
				class="btn-themed bg-app-danger text-white px-3 py-1 hover:brightness-110 transition-all"
				@click="deleteTask(task, 'tasks')"
			>
				<Trash2 :size="16" />
			</button>
		</template>
		<div v-if="task.blocked" class="mb-3 px-3 py-2 rounded border border-app-warning bg-app-warning/10 flex items-start gap-2">
				<Ban :size="14" class="text-app-warning shrink-0 mt-0.5" aria-hidden="true" />
				<div class="flex-1">
					<p class="text-xs font-rajdhani font-semibold text-app-warning uppercase tracking-widest mb-1">Blocked</p>
					<input
						v-model="task.blockedReason"
						type="text"
						placeholder="Reason (optional)"
						class="w-full bg-transparent border-0 border-b border-app-warning/50 text-text-primary text-sm font-rajdhani focus:outline-none focus:border-app-warning px-0 py-0.5"
					/>
				</div>
			</div>
			<form ref="taskForm">
			<div class="mb-3">
				<label for="task" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Task</label>
				<input
					id="task"
					v-model="task.name"
					type="text"
					autocomplete="off"
					required
					class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					:class="valid.task === false ? 'border-app-danger' : ''"
				/>
				<p v-if="valid.task === false" class="text-app-danger text-sm mt-1">This is invalid input</p>
			</div>
			<div class="flex justify-between gap-2">
				<div class="w-1/2">
					<label for="priority" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Priority</label>
					<select
						id="priority"
						v-model="task.priority"
						class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					>
						<option
							v-for="option in priorityOptions"
							:key="option.value"
							:value="option.value"
						>
							{{ option.text }}
						</option>
					</select>
				</div>
				<div class="w-1/2">
					<label for="sizing" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Size</label>
					<select
						id="sizing"
						v-model="task.sizing"
						class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					>
						<option
							v-for="option in sizingOptions"
							:key="option.value"
							:value="option.value"
						>
							{{ option.text }}
						</option>
					</select>
				</div>
			</div>
			<div class="mt-3">
				<label for="category" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Category</label>
				<input
					id="category"
					v-model="task.category"
					list="tags"
					autocomplete="off"
					required
					class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					:class="valid.category === false ? 'border-app-danger' : ''"
				/>
				<datalist id="tags">
					<option
						v-for="(category, index) in getCategories"
						:key="`${index}-${category}`"
						:value="category"
					>
					</option>
				</datalist>
				<p v-if="valid.category === false" class="text-app-danger text-sm mt-1">This is invalid input</p>
			</div>
			<div class="mt-3">
				<label for="targetDate" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Target Date</label>
				<div class="flex items-center gap-2">
					<input
						id="targetDate"
						type="date"
						v-model="task.targetDateTime"
						:min="todayDate"
						class="flex-1 border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					/>
					<button
						type="button"
						@click="task.targetDateTime = null"
						class="px-2 py-2 text-text-secondary hover:text-accent border border-border-default bg-surface-base rounded transition-colors"
					>
						<X :size="16" />
					</button>
					<div>
						<input
							type="checkbox"
							class="sr-only peer"
							id="hardDeadlineToggle"
							autocomplete="off"
							v-model="task.isHardDeadline"
						/>
						<label
							class="block px-3 py-2 border-2 rounded cursor-pointer font-rajdhani font-semibold transition-colors peer-checked:bg-app-danger peer-checked:text-white peer-checked:border-app-danger border-app-danger text-app-danger hover:bg-app-danger/10 whitespace-nowrap"
							for="hardDeadlineToggle"
						>
							Hard Deadline
						</label>
					</div>
				</div>
			</div>
		<div class="mt-3">
			<label class="block mb-1 font-rajdhani font-semibold text-text-secondary">Depends On</label>
			<Multiselect
				v-model="task.dependsOn"
				:options="dependsOnOptions"
				mode="tags"
				:searchable="true"
				:close-on-select="false"
				label="label"
				value-prop="value"
				:object="false"
				placeholder="Select prerequisite tasks"
			/>
			<p v-if="valid.dependsOn === false" class="text-app-danger text-sm mt-1">
				Circular dependency detected — this would create a loop.
			</p>
		</div>
		</form>
	</BaseModal>
</template>

<script>
import { getDatabase, ref, set } from 'firebase/database'
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { logger } from '@/utils/logger'
import BaseModal from './ui/BaseModal.vue'
import { Trash2, X, Ban } from 'lucide-vue-next'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

export default {
	components: { BaseModal, Trash2, X, Ban, Multiselect },

	setup() {
		const store = useAppStore()
		const { createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule, detectCircularDependency, cleanupDependsOn } = useTaskActions()
		return { store, createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule, detectCircularDependency, cleanupDependsOn }
	},

	created() {
		this.taskDefaults.sizing = this.sizes.short
		this.task = { ...this.taskDefaults }
	},

	data() {
		return {
			task: {},
			taskDefaults: {
				name: null,
				priority: 2,
				sizing: null,
				category: null,
				targetDateTime: null,
				deadline: null,
				isHardDeadline: false,
				dependsOn: [],
				score: 0,
				type: 'userTask'
			},
			valid: {
				task: null,
				category: null,
				dependsOn: null
			}
		}
	},

	computed: {
		priorities() {
			return this.store.priorities
		},

		sizes() {
			return this.store.getAccountSettings.taskLength
		},

		todayDate() {
			return new Date().toISOString().split('T')[0]
		},

		priorityOptions() {
			let options = []
			for (let priority in this.priorities) {
				options.push({
					text: priority.charAt(0).toUpperCase() + priority.slice(1),
					value: this.priorities[priority].value
				})
			}
			return options
		},

		sizingOptions() {
			let options = []
			for (let size in this.sizes) {
				options.push({
					text: this.store.getSizeLabel(this.sizes[size]),
					value: this.sizes[size]
				})
			}
			return options
		},

		taskToPatch() {
			return this.store.taskToPatch
		},

		getCategories() {
			return this.store.getCategories
		},

		dependsOnOptions() {
			return this.store.getPrioritisedTasks
				.filter(t => t.id !== this.task.id)
				.map(t => ({ value: t.id, label: t.name }))
		}
	},

	methods: {
		show() {
			this.$refs.modalRef.show()
		},

		resetModal() {
			this.task = {}
			this.task = { ...this.taskDefaults }

			if (this.taskToPatch.id) {
				this.task = this.taskToPatch
			} else {
				this.task.id = this.createGuid()
			}
		},

		handleOk() {
			if (this.isFormValid()) {
				if (this.task.dependsOn?.length > 0) {
					const hasCycle = this.detectCircularDependency(
						this.task.id, this.task.dependsOn, this.store.getPrioritisedTasks
					)
					if (hasCycle) {
						this.valid.dependsOn = false
						return
					}
				}
				this.valid.dependsOn = null

				if (!this.task.createdDateTime) {
					this.task.createdDateTime = new Date().toString()
				}

				if (!this.task.targetDateTime) {
					this.task.isHardDeadline = false
				}

				this.task.score = this.scorePriority(this.task)

				this.saveToDatabase()
				this.rescoreActiveBacklog()
				this.handleScheduleSync()
				this.$refs.modalRef.close()
			}
		},

		clearTaskToPatch() {
			this.store.setTaskToPatch({ taskToPatch: null })
		},

		async saveToDatabase() {
			const db = getDatabase(this.store.app)
			const tasksRef = ref(
				db,
				`tasks/${this.store.user.uid}/${this.task.id}`
			)

			// Deep clone to strip Vue 3 reactivity proxies before Firebase serialization
			const plainTask = JSON.parse(JSON.stringify(this.task))
			await set(tasksRef, plainTask)
			logger.log('added task: ', plainTask)
		},

		isFormValid() {
			const valid = this.$refs.taskForm.checkValidity()

			if (!valid) {
				this.valid.task = this.task.name ? null : false
				this.valid.category = this.task.category ? null : false
			}

			return valid
		},

		handleScheduleSync() {
			const result = this.syncTaskToSchedule(this.task)
			if (result.inSchedule && result.anyChanged) {
				if (result.categoryChanged && !result.categoryMatchesFilter) {
					// Category no longer matches schedule filter — prompt user
					this.store.setPendingScheduleUpdate(
						JSON.parse(JSON.stringify(this.task))
					)
				} else {
					// Auto-update the schedule
					this.applyScheduleUpdate(this.task)
					this.store.showNotification({
						title: 'Schedule Updated',
						text: `"${this.task.name}" has been updated in your schedule.`
					})
				}
			}
		},

		async deleteTask(task) {
			const wasInSchedule = await this.removeTaskFromSchedule(task.id)
			this.removeTask(task, 'tasks')
			this.cleanupDependsOn(task.id)
			if (wasInSchedule) {
				this.store.showNotification({
					title: 'Schedule Updated',
					text: `"${task.name}" has been removed from your schedule.`
				})
			}
			this.$refs.modalRef.close()
		}
	},
	expose: ['show']
}
</script>

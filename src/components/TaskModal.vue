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
			<h5 class="text-lg font-rajdhani font-semibold">
				{{ taskToPatch.id ? 'Edit' : 'Add' }} A Task
			</h5>
			<button
				v-if="taskToPatch.id"
				class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
				@click="deleteTask(task, 'tasks')"
			>
				<i class="fas fa-trash-alt"></i>
			</button>
		</template>
		<form ref="taskForm">
			<div class="mb-3">
				<label for="task" class="block mb-1 font-rajdhani font-semibold">Task</label>
				<input
					id="task"
					v-model="task.name"
					type="text"
					autocomplete="off"
					required
					class="w-full border rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
					:class="valid.task === false ? 'border-red-500' : ''"
				/>
				<p v-if="valid.task === false" class="text-red-500 text-sm mt-1">This is invalid input</p>
			</div>
			<div class="flex justify-between gap-2">
				<div class="w-1/2">
					<label for="priority" class="block mb-1 font-rajdhani font-semibold">Priority</label>
					<select
						id="priority"
						v-model="task.priority"
						class="w-full border rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
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
					<label for="sizing" class="block mb-1 font-rajdhani font-semibold">Size</label>
					<select
						id="sizing"
						v-model="task.sizing"
						class="w-full border rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
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
				<label for="category" class="block mb-1 font-rajdhani font-semibold">Category</label>
				<input
					id="category"
					v-model="task.category"
					list="tags"
					autocomplete="off"
					required
					class="w-full border rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
					:class="valid.category === false ? 'border-red-500' : ''"
				/>
				<datalist id="tags">
					<option
						v-for="(category, index) in getCategories"
						:key="`${index}-${category}`"
						:value="category"
					>
					</option>
				</datalist>
				<p v-if="valid.category === false" class="text-red-500 text-sm mt-1">This is invalid input</p>
			</div>
			<div class="mt-3">
				<label for="targetDate" class="block mb-1 font-rajdhani font-semibold">Target Date</label>
				<div class="flex items-center gap-2">
					<input
						id="targetDate"
						type="date"
						v-model="task.targetDateTime"
						:min="todayDate"
						class="flex-1 border rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="button"
						@click="task.targetDateTime = null"
						class="px-2 py-2 text-gray-500 hover:text-gray-700 border rounded"
					>
						<i class="fas fa-times"></i>
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
							class="block px-3 py-2 border-2 rounded cursor-pointer font-rajdhani font-semibold transition-colors peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600 border-red-600 text-red-600 hover:bg-red-50 whitespace-nowrap"
							for="hardDeadlineToggle"
						>
							Hard Deadline
						</label>
					</div>
				</div>
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

export default {
	components: { BaseModal },

	setup() {
		const store = useAppStore()
		const { createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule } = useTaskActions()
		return { store, createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule }
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
				score: 0,
				type: 'userTask'
			},
			valid: {
				task: null,
				category: null
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

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
			<div v-if="taskToPatch.id">
				<div v-if="showRecurrenceDeletePrompt" class="flex items-center gap-1">
					<button
						type="button"
						class="btn-themed border border-accent text-accent px-2 py-1 text-xs font-rajdhani font-semibold hover:bg-accent/20 transition-all"
						@click="deleteInstanceOnly(task)"
					>
						Skip instance
					</button>
					<button
						type="button"
						class="btn-themed bg-app-danger text-white px-2 py-1 text-xs font-rajdhani font-semibold hover:brightness-110 transition-all"
						@click="stopAllRecurrences(task)"
					>
						Stop recurring
					</button>
					<button
						type="button"
						class="px-2 py-1 text-text-secondary hover:text-accent transition-colors"
						@click="showRecurrenceDeletePrompt = false"
						aria-label="Cancel delete"
					>
						<X :size="16" />
					</button>
				</div>
				<button
					v-else
					class="btn-themed bg-app-danger text-white px-3 py-1 hover:brightness-110 transition-all"
					@click="deleteTask(task)"
				>
					<Trash2 :size="16" />
				</button>
			</div>
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
			<!-- Task Details -->
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

			<hr class="my-4 border-border-default" />

			<!-- Scheduling -->
			<div>
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

			<hr class="my-4 border-border-default" />

			<!-- Recurrence -->
			<div>
				<div>
					<input
						type="checkbox"
						class="sr-only peer"
						id="recurrenceToggle"
						:checked="hasRecurrence"
						@change="handleRecurrenceToggle"
					/>
					<label
						for="recurrenceToggle"
						class="flex items-center justify-center gap-1.5 w-full cursor-pointer px-3 py-2 border-2 rounded font-rajdhani font-semibold transition-colors peer-checked:bg-accent peer-checked:text-text-inverse peer-checked:border-accent border-accent text-accent hover:bg-accent/10"
					>
						<Repeat :size="14" aria-hidden="true" />
						Repeat this task
					</label>
				</div>
				<div
					class="grid transition-[grid-template-rows] duration-200 ease-out"
					:style="{ gridTemplateRows: hasRecurrence ? '1fr' : '0fr' }"
				>
					<div class="overflow-hidden">
						<div v-if="hasRecurrence" class="mt-2 border border-border-default rounded p-4">
							<!-- Pattern -->
							<div>
								<label class="block mb-1 font-rajdhani font-semibold text-text-secondary text-sm">Pattern</label>
								<div class="flex gap-1">
									<button
										v-for="type in ['daily', 'weekly', 'monthly']"
										:key="type"
										type="button"
										class="flex-1 px-2 py-1.5 text-sm font-rajdhani font-semibold border rounded transition-colors capitalize"
										:class="task.recurrence?.type === type
											? 'bg-accent/10 border-accent text-accent'
											: 'border-border-default text-text-secondary hover:border-accent/50'"
										@click="setRecurrenceType(type)"
									>{{ type }}</button>
								</div>
							</div>
							<div class="flex flex-wrap items-center gap-2 mt-3">
								<span class="text-sm font-rajdhani text-text-secondary">Every</span>
								<input
									type="number"
									v-model.number="task.recurrence.interval"
									min="1"
									class="w-16 border border-border-default bg-surface-base text-text-primary rounded px-2 py-1.5 font-rajdhani text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
								/>
								<span class="text-sm font-rajdhani text-text-secondary">{{ intervalLabel }}</span>
								<template v-if="task.recurrence?.type === 'monthly'">
									<span class="text-sm font-rajdhani text-text-secondary">on day</span>
									<input
										type="number"
										v-model.number="task.recurrence.dayOfMonth"
										min="1"
										max="31"
										class="w-16 border border-border-default bg-surface-base text-text-primary rounded px-2 py-1.5 font-rajdhani text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
									/>
								</template>
								<template v-if="task.recurrence?.type === 'weekly'">
									<span class="text-sm font-rajdhani text-text-secondary">on</span>
									<Multiselect
										v-model="task.recurrence.daysOfWeek"
										:options="daysOfWeekOptions"
										mode="tags"
										:searchable="false"
										:close-on-select="false"
										label="label"
										value-prop="value"
										:object="false"
										placeholder="Select days"
										class="flex-1 min-w-[10rem]"
									/>
								</template>
							</div>

							<hr class="my-4 border-border-default" />

							<!-- Instance Deadline -->
							<div>
								<label class="block mb-1 font-rajdhani font-semibold text-text-secondary text-sm">Instance Deadline</label>
								<div class="flex items-center gap-2">
									<input
										type="number"
										:value="task.recurrence.deadlineDays"
										@input="updateDeadlineDays"
										min="0"
										placeholder="—"
										class="w-16 border border-border-default bg-surface-base text-text-primary rounded px-2 py-1.5 font-rajdhani text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
									/>
									<span class="text-sm font-rajdhani text-text-secondary">days after task appears</span>
									<button
										v-if="task.recurrence.deadlineDays != null"
										type="button"
										@click="clearDeadlineDays"
										class="px-2 py-1.5 text-text-secondary hover:text-accent border border-border-default bg-surface-base rounded transition-colors"
									>
										<X :size="14" />
									</button>
									<div :class="{ 'opacity-30 pointer-events-none': task.recurrence.deadlineDays == null }">
										<input
											type="checkbox"
											class="sr-only peer"
											id="deadlineIsHard"
											v-model="task.recurrence.deadlineIsHard"
										/>
										<label
											for="deadlineIsHard"
											class="block px-3 py-1.5 border-2 rounded cursor-pointer font-rajdhani font-semibold text-sm transition-colors peer-checked:bg-app-danger peer-checked:text-white peer-checked:border-app-danger border-app-danger text-app-danger hover:bg-app-danger/10 whitespace-nowrap"
										>
											Hard Deadline
										</label>
									</div>
								</div>
							</div>

							<hr class="my-4 border-border-default" />

							<!-- Catch up missed -->
							<div>
								<div class="flex justify-between items-center">
									<div class="flex items-center gap-1.5">
										<span class="font-rajdhani font-semibold text-text-secondary text-sm">Catch up missed</span>
										<button
											type="button"
											class="text-text-secondary hover:text-accent transition-colors"
											@click="showCatchUpInfo = !showCatchUpInfo"
											aria-label="What does catch up missed mean?"
										>
											<Info :size="14" />
										</button>
									</div>
									<label class="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											v-model="task.recurrence.catchUpMissed"
											class="sr-only peer"
										/>
										<div class="w-11 h-6 bg-surface-hover rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-text-primary after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
									</label>
								</div>
								<div
									class="grid transition-[grid-template-rows] duration-200 ease-out"
									:style="{ gridTemplateRows: showCatchUpInfo ? '1fr' : '0fr' }"
								>
									<p class="overflow-hidden text-xs font-rajdhani text-text-secondary mt-0 leading-relaxed">
										<span class="block pt-1">By default, completing a late task creates one next occurrence from today. Enable this to also create all the missed occurrences in between, so nothing is skipped.</span>
									</p>
								</div>
							</div>

							<hr class="my-4 border-border-default" />

							<!-- Ends -->
							<div>
								<label class="block mb-1 font-rajdhani font-semibold text-text-secondary text-sm">Ends</label>
								<div class="flex gap-1 mb-2">
									<button
										v-for="mode in ['never', 'date', 'count']"
										:key="mode"
										type="button"
										class="flex-1 px-2 py-1.5 text-sm font-rajdhani font-semibold border rounded transition-colors capitalize"
										:class="endsMode === mode
											? 'bg-accent/10 border-accent text-accent'
											: 'border-border-default text-text-secondary hover:border-accent/50'"
										@click="setEnds(mode)"
									>{{ mode === 'count' ? 'After' : mode }}</button>
								</div>
								<div
									class="grid transition-[grid-template-rows] duration-200 ease-out"
									:style="{ gridTemplateRows: endsMode !== 'never' ? '1fr' : '0fr' }"
								>
									<div class="overflow-hidden">
										<input
											v-show="endsMode === 'date'"
											type="date"
											v-model="task.recurrence.endDate"
											:min="todayDate"
											class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
										/>
										<div v-show="endsMode === 'count'" class="flex items-center gap-2">
											<input
												type="number"
												v-model.number="task.recurrence.endAfterCount"
												min="1"
												class="w-16 border border-border-default bg-surface-base text-text-primary rounded px-2 py-1.5 font-rajdhani text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
											/>
											<span class="text-sm font-rajdhani text-text-secondary">occurrences</span>
										</div>
									</div>
								</div>
							</div>
						</div>
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
import { Trash2, X, Ban, Repeat, Info } from 'lucide-vue-next'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

export default {
	components: { BaseModal, Trash2, X, Ban, Repeat, Info, Multiselect },

	setup() {
		const store = useAppStore()
		const { createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule, detectCircularDependency, cleanupDependsOn, calculateNextOccurrence, buildRecurringInstance, shouldCreateNextInstance } = useTaskActions()
		return { store, createGuid, scorePriority, rescoreActiveBacklog, removeTask, syncTaskToSchedule, applyScheduleUpdate, removeTaskFromSchedule, detectCircularDependency, cleanupDependsOn, calculateNextOccurrence, buildRecurringInstance, shouldCreateNextInstance }
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
				type: 'userTask',
				recurrence: null,
				recurrenceParentId: null,
				recurrenceCount: 0
			},
			valid: {
				task: null,
				category: null,
				dependsOn: null
			},
			showRecurrenceDeletePrompt: false,
			showCatchUpInfo: false
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
		},

		daysOfWeekOptions() {
			return [
				{ value: 0, label: 'Sunday' },
				{ value: 1, label: 'Monday' },
				{ value: 2, label: 'Tuesday' },
				{ value: 3, label: 'Wednesday' },
				{ value: 4, label: 'Thursday' },
				{ value: 5, label: 'Friday' },
				{ value: 6, label: 'Saturday' }
			]
		},

		hasRecurrence() {
			return !!this.task.recurrence
		},

		endsMode() {
			if (!this.task.recurrence) return 'never'
			if (this.task.recurrence.endDate) return 'date'
			if (this.task.recurrence.endAfterCount != null) return 'count'
			return 'never'
		},

		intervalLabel() {
			if (!this.task.recurrence) return ''
			const { type, interval } = this.task.recurrence
			if (type === 'daily') return interval === 1 ? 'day' : 'days'
			if (type === 'weekly') return interval === 1 ? 'week' : 'weeks'
			if (type === 'monthly') return interval === 1 ? 'month' : 'months'
			return ''
		}
	},

	methods: {
		show() {
			this.$refs.modalRef.show()
		},

		resetModal() {
			this.task = {}
			this.task = { ...this.taskDefaults }
			this.showRecurrenceDeletePrompt = false
			this.showCatchUpInfo = false

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
			if (task.recurrence) {
				this.showRecurrenceDeletePrompt = true
				return
			}
			await this._doDelete(task)
		},

		async deleteInstanceOnly(task) {
			if (this.shouldCreateNextInstance(task)) {
				const nextDate = this.calculateNextOccurrence(task.recurrence, new Date())
				const newInstance = this.buildRecurringInstance(task, nextDate)
				const db = getDatabase(this.store.app)
				await set(ref(db, `tasks/${this.store.user.uid}/${newInstance.id}`), newInstance)
			}
			await this._doDelete(task)
		},

		async stopAllRecurrences(task) {
			await this._doDelete(task)
		},

		async _doDelete(task) {
			const list = task.completedDateTime ? 'completed' : 'tasks'
			const wasInSchedule = await this.removeTaskFromSchedule(task.id)
			this.removeTask(task, list)
			this.cleanupDependsOn(task.id)
			if (wasInSchedule) {
				this.store.showNotification({
					title: 'Schedule Updated',
					text: `"${task.name}" has been removed from your schedule.`
				})
			}
			this.$refs.modalRef.close()
		},

		setRecurrenceType(type) {
			this.task.recurrence.type = type
			this.task.recurrence.interval = 1
			this.task.recurrence.daysOfWeek = []
			this.task.recurrence.dayOfMonth = 1
		},

		handleRecurrenceToggle(e) {
			if (e.target.checked) {
				this.task.recurrence = {
					type: 'daily',
					interval: 1,
					daysOfWeek: [],
					dayOfMonth: 1,
					endDate: null,
					endAfterCount: null,
					catchUpMissed: false,
					deadlineDays: null,
					deadlineIsHard: false
				}
			} else {
				this.task.recurrence = null
			}
		},

		updateDeadlineDays(event) {
			const val = event.target.value
			if (val === '' || val == null) {
				this.task.recurrence.deadlineDays = null
				this.task.recurrence.deadlineIsHard = false
			} else {
				this.task.recurrence.deadlineDays = Math.max(0, Number(val))
			}
		},

		clearDeadlineDays() {
			this.task.recurrence.deadlineDays = null
			this.task.recurrence.deadlineIsHard = false
		},

		setEnds(mode) {
			if (mode === 'never') {
				this.task.recurrence.endDate = null
				this.task.recurrence.endAfterCount = null
			} else if (mode === 'date') {
				this.task.recurrence.endDate = new Date().toISOString().split('T')[0]
				this.task.recurrence.endAfterCount = null
			} else if (mode === 'count') {
				this.task.recurrence.endDate = null
				this.task.recurrence.endAfterCount = 5
			}
		}
	},
	expose: ['show']
}
</script>

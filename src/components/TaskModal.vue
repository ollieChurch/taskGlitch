<template>
	<b-modal
		id="taskModal"
		@show="resetModal"
		@ok="handleOk"
		@hide="clearTaskToPatch"
		hide-header-close
	>
		<template #modal-header>
			<b-card-title
				>{{ taskToPatch.id ? 'Edit' : 'Add' }} A Task</b-card-title
			>
			<b-btn
				v-if="taskToPatch.id"
				variant="danger"
				@click="deleteTask(task, 'tasks')"
			>
				<i class="fas fa-trash-alt"></i>
			</b-btn>
		</template>
		<b-form ref="taskForm">
			<b-form-group
				label="Task"
				label-for="task"
				invalid-feedback="this is invalid input"
				:state="valid.task"
				class="form-input"
			>
				<b-form-input
					id="task"
					v-model="task.name"
					:state="valid.task"
					trim
					autocomplete="off"
					required
				></b-form-input>
			</b-form-group>
			<div class="d-flex justify-content-between">
				<b-form-group
					label="Priority"
					label-for="priority"
					class="form-input col-6 pe-2 ps-0"
				>
					<b-form-select
						id="priority"
						v-model="task.priority"
						:options="priorityOptions"
						class="form-control"
						size="lg"
					>
					</b-form-select>
				</b-form-group>
				<b-form-group
					label="Size"
					label-for="sizing"
					class="form-input col-6 ps-2 pe-0"
				>
					<b-form-select
						id="sizing"
						v-model="task.sizing"
						:options="sizingOptions"
						class="form-control"
						size="lg"
					>
					</b-form-select>
				</b-form-group>
			</div>

			<b-form-group
				label="Category"
				label-for="category"
				invalid-feedback="this is invalid input"
				:state="valid.category"
				class="form-input"
			>
				<b-form-input
					id="category"
					v-model="task.category"
					:state="valid.category"
					list="tags"
					trim
					autocomplete="off"
					required
				></b-form-input>
				<datalist id="tags" autocomplete="false">
					<option
						v-for="(category, index) in getCategories"
						:key="`${index}-${category}`"
					>
						{{ category }}
					</option>
				</datalist>
			</b-form-group>
			<div class="d-flex flex-wrap align-items-end justify-content-between gap-2">
				<b-form-group
					label="Target Date"
					label-for="targetDate"
					class="form-input col-sm-8 col-12 px-0"
				>
					<b-form-datepicker
						id="targetDate"
						v-model="task.targetDateTime"
						:min="new Date()"
						reset-button
					></b-form-datepicker>
				</b-form-group>
				<div>
					<input
						type="checkbox"
						class="btn-check"
						id="hardDeadlineToggle"
						autocomplete="off"
						v-model="task.isHardDeadline"
					/>
					<label
						class="btn btn-outline-danger form-input"
						for="hardDeadlineToggle"
					>
						Hard Deadline
					</label>
				</div>
			</div>
		</b-form>
	</b-modal>
</template>

<script>
	import { getDatabase, ref, set } from 'firebase/database'
	import { mapGetters } from 'vuex'

	export default {
		created() {
			this.taskDefaults.sizing = this.sizes.short
			this.task = { ...this.taskDefaults }
		},

		data() {
			return {
				task: {},

				taskDefaults: {
					name: null,
					priority: this.$store.state.priorities.medium.value,
					sizing: null,
					category: null,
					targetDateTime: null,
					deadline: null,
					isHardDeadline: false,
					score: 0,
					type: this.$store.state.taskType.userTask
				},

				valid: {
					task: null,
					category: null
				}
			}
		},

		computed: {
			...mapGetters(['getCategories', 'getAccountSettings']),

			priorities() {
				return this.$store.state.priorities
			},

			sizes() {
				return this.getAccountSettings.taskLength
			},

			priorityOptions() {
				let options = []
				for (let priority in this.priorities) {
					options.push({
						text: priority,
						value: this.priorities[priority].value
					})
				}

				return options
			},

			sizingOptions() {
				let options = []
				for (let size in this.sizes) {
					options.push({
						text: size,
						value: this.sizes[size]
					})
				}

				return options
			},

			taskToPatch() {
				return this.$store.state.taskToPatch
			}
		},

		methods: {
			resetModal() {
				this.task = {}
				this.task = { ...this.taskDefaults }

				if (this.taskToPatch.id) {
					this.task = this.taskToPatch
				} else {
					this.task.id = this.createGuid()
				}
			},

			handleOk(bvModalEvent) {
				bvModalEvent.preventDefault()
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

					this.$nextTick(() => {
						this.$bvModal.hide('taskModal')
					})
				}
			},

			clearTaskToPatch() {
				this.$store.commit('setTaskToPatch', { taskToPatch: null })
			},

			async saveToDatabase() {
				const db = getDatabase(this.$store.state.app)
				const tasksRef = ref(
					db,
					`tasks/${this.$store.state.user.uid}/${this.task.id}`
				)

				await set(tasksRef, this.task)
				console.log('added task: ', this.task)
			},

			isFormValid() {
				const valid = this.$refs.taskForm.checkValidity()

				if (!valid) {
					this.valid.task = this.task.name ? null : false
					this.valid.category = this.task.category ? null : false
				}

				return valid
			},

			deleteTask(task) {
				this.removeTask(task, 'tasks')

				this.$nextTick(() => {
					this.$bvModal.hide('taskModal')
				})
			}
		}
	}
</script>
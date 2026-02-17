<template>
	<BaseModal ref="modalRef" @ok="onSubmit" :hideHeaderClose="true" title="Schedule Setup">
		<form ref="scheduleSetUpForm" class="text-left" @submit.prevent="onSubmit">
			<div>
				<label class="block mb-1 font-rajdhani font-semibold text-text-secondary">Options</label>
				<div class="flex flex-wrap gap-3">
					<div>
						<input
							type="checkbox"
							class="sr-only peer"
							id="includeBreaksToggle"
							autocomplete="off"
							v-model="includeBreaks"
						/>
						<label
							class="px-3 py-2 border-2 rounded cursor-pointer font-rajdhani font-semibold transition-colors peer-checked:bg-app-success peer-checked:text-text-inverse peer-checked:border-app-success border-app-success text-app-success hover:bg-app-success/10"
							for="includeBreaksToggle"
						>
							Add Breaks
						</label>
					</div>
				</div>
			</div>
			<div class="mt-3">
				<label for="sessionDate" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Date</label>
				<div class="flex gap-2">
					<input
						id="sessionDate"
						type="date"
						v-model="sessionDate"
						:min="todayDate"
						class="flex-1 border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
					/>
					<button
						type="button"
						@click="sessionDate = todayDate"
						class="px-2 py-1 text-text-secondary hover:text-accent border border-border-default bg-surface-base rounded transition-colors"
					>
						<X :size="16" />
					</button>
				</div>
			</div>
			<div class="mt-3">
				<label for="fromTime" class="block mb-1 font-rajdhani font-semibold text-text-secondary">From</label>
				<input
					id="fromTime"
					type="time"
					v-model="fromTime"
					class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
				/>
			</div>
			<div class="mt-3">
				<label for="toTime" class="block mb-1 font-rajdhani font-semibold text-text-secondary">To</label>
				<input
					id="toTime"
					type="time"
					v-model="toTime"
					class="w-full border border-border-default bg-surface-base text-text-primary rounded px-3 py-2 font-rajdhani focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
				/>
			</div>
			<div class="mt-3">
				<label for="categoriesToInclude" class="block mb-1 font-rajdhani font-semibold text-text-secondary">Categories To Include</label>
				<Multiselect
					v-model="categoriesToInclude"
					:options="getCategories"
					mode="tags"
					:searchable="false"
					:close-on-select="false"
					placeholder="select categories"
				/>
			</div>
		</form>
	</BaseModal>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import { useRouter, useRoute } from 'vue-router'
import BaseModal from './ui/BaseModal.vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { X } from 'lucide-vue-next'

export default {
	components: {
		BaseModal,
		Multiselect,
		X
	},

	setup() {
		const store = useAppStore()
		const router = useRouter()
		const route = useRoute()
		const { rescoreActiveBacklog, getScheduleTimes, getScheduleTasks, saveScheduleToDatabase } = useTaskActions()
		return { store, router, route, rescoreActiveBacklog, getScheduleTimes, getScheduleTasks, saveScheduleToDatabase }
	},

	data() {
		return {
			sessionDate: new Date().toISOString().split('T')[0],
			fromTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
			toTime: null,
			categoriesToInclude: null,
			finish: null,
			start: null,
			includeBreaks: false
		}
	},

	created() {
		this.categoriesToInclude = this.getCategories
	},

	computed: {
		getCategories() {
			return this.store.getCategories
		},
		getPrioritisedTasks() {
			return this.store.getPrioritisedTasks
		},
		todayDate() {
			return new Date().toISOString().split('T')[0]
		}
	},

	methods: {
		show() {
			this.$refs.modalRef.show()
		},

		async onSubmit() {
			await this.rescoreActiveBacklog()
			const filteredTasks = this.getPrioritisedTasks.filter(x =>
				this.categoriesToInclude.includes(x.category)
			)

			const calculatedTimes = this.getScheduleTimes(
				this.sessionDate,
				this.fromTime,
				this.toTime
			)

			const scheduleTasks = this.getScheduleTasks(
				filteredTasks,
				calculatedTimes.sessionInMins,
				this.includeBreaks
			)

			if (!this.toTime) {
				calculatedTimes.finish.setMinutes(
					calculatedTimes.start.getMinutes() +
						scheduleTasks.totalTaskTime
				)
			}

			// Set actualStartTime on the first user task
			const now = new Date()
			const scheduleStart = calculatedTimes.start
			const startTime = (now > scheduleStart ? now : scheduleStart).toISOString()

			const firstUserTask = scheduleTasks.tasks.find(
				t => t.type == null || t.type === this.store.taskType.userTask
			)
			if (firstUserTask) {
				firstUserTask.actualStartTime = startTime
			}

			const scheduleDetails = {
				categoriesToInclude: this.categoriesToInclude,
				tasks: scheduleTasks.tasks,
				start: calculatedTimes.start.toString(),
				finish: calculatedTimes.finish.toString(),
				includeBreaks: this.includeBreaks
			}

			this.saveScheduleToDatabase(scheduleDetails)

			this.$refs.modalRef.close()
			if (this.route.path != '/schedule') {
				this.router.push('/schedule')
			}
		}
	},
	expose: ['show']
}
</script>

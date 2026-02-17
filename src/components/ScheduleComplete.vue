<template>
	<div class="text-center py-6">
		<div class="trophy-bounce mb-4">
			<Trophy :size="64" class="text-amber-400 mx-auto" />
		</div>
		<h2 class="font-wallpoet text-2xl mb-2 text-accent">Schedule Complete!</h2>
		<p class="text-text-secondary font-rajdhani mb-6">Great work. Here's how your session went.</p>

		<div class="depth-panel depth-highlight p-4 mb-6 text-left rounded-lg border border-border-visible">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-text-secondary font-rajdhani mb-1">Tasks Completed</p>
					<p class="text-2xl font-rajdhani font-semibold text-text-heading">{{ summary.tasksCompleted }}</p>
				</div>
				<div>
					<p class="text-sm text-text-secondary font-rajdhani mb-1">Session Duration</p>
					<p class="text-2xl font-rajdhani font-semibold text-text-heading">{{ formatDuration(summary.actualMins) }}</p>
				</div>
				<div>
					<p class="text-sm text-text-secondary font-rajdhani mb-1">Estimated Time</p>
					<p class="text-2xl font-rajdhani font-semibold text-text-heading">{{ formatDuration(summary.estimatedMins) }}</p>
				</div>
				<div>
					<p class="text-sm text-text-secondary font-rajdhani mb-1">Difference</p>
					<p
						class="text-2xl font-rajdhani font-semibold"
						:class="differenceClass"
					>
						{{ differenceText }}
					</p>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap gap-3">
			<button
				@click="$emit('newSchedule')"
				class="btn-themed flex-1 bg-app-success text-text-inverse py-2 px-4 font-bold font-rajdhani hover:brightness-110 transition-all"
			>
				New Schedule
			</button>
			<button
				@click="$emit('clearSchedule')"
				class="btn-themed flex-1 bg-surface-hover text-text-primary border border-border-default py-2 px-4 font-bold font-rajdhani hover:border-accent-dim transition-all"
			>
				Done
			</button>
		</div>
	</div>
</template>

<script>
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-vue-next'

export default {
	components: { Trophy },

	props: {
		summary: {
			type: Object,
			required: true
		}
	},

	emits: ['clearSchedule', 'newSchedule'],

	mounted() {
		this.fireConfetti()
	},

	computed: {
		differenceText() {
			if (this.summary.actualMins == null || this.summary.estimatedMins == null) {
				return '—'
			}
			const diff = this.summary.actualMins - this.summary.estimatedMins
			if (diff === 0) return 'On time'
			const absDiff = Math.abs(diff)
			return diff > 0
				? `${this.formatDuration(absDiff)} over`
				: `${this.formatDuration(absDiff)} under`
		},

		differenceClass() {
			if (this.summary.actualMins == null || this.summary.estimatedMins == null) {
				return 'text-text-secondary'
			}
			const diff = this.summary.actualMins - this.summary.estimatedMins
			if (diff <= 0) return 'text-app-success'
			return 'text-app-warning'
		}
	},

	methods: {
		formatDuration(mins) {
			if (mins == null) return '—'
			if (mins < 60) return `${mins}m`
			const hours = Math.floor(mins / 60)
			const remaining = mins % 60
			return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
		},

		fireConfetti() {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			})
		}
	}
}
</script>

<style scoped>
.trophy-bounce {
	animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	50% {
		transform: scale(1.2);
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>

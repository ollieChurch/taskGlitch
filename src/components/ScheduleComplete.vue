<template>
	<div class="text-center py-6">
		<div class="trophy-bounce mb-4">
			<i class="fas fa-trophy text-yellow-400 text-6xl"></i>
		</div>
		<h2 class="font-wallpoet text-2xl mb-2">Schedule Complete!</h2>
		<p class="text-gray-600 font-rajdhani mb-6">Great work. Here's how your session went.</p>

		<div class="bg-white rounded-lg shadow-sm border p-4 mb-6 text-left">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-sm text-gray-500 font-rajdhani mb-1">Tasks Completed</p>
					<p class="text-2xl font-rajdhani font-semibold">{{ summary.tasksCompleted }}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 font-rajdhani mb-1">Session Duration</p>
					<p class="text-2xl font-rajdhani font-semibold">{{ formatDuration(summary.actualMins) }}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 font-rajdhani mb-1">Estimated Time</p>
					<p class="text-2xl font-rajdhani font-semibold">{{ formatDuration(summary.estimatedMins) }}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 font-rajdhani mb-1">Difference</p>
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
				class="flex-1 bg-green-600 text-white py-2 px-4 rounded font-bold font-rajdhani hover:bg-green-700"
			>
				New Schedule
			</button>
			<button
				@click="$emit('clearSchedule')"
				class="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-bold font-rajdhani hover:bg-gray-600"
			>
				Done
			</button>
		</div>
	</div>
</template>

<script>
import confetti from 'canvas-confetti'

export default {
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
				return 'text-gray-500'
			}
			const diff = this.summary.actualMins - this.summary.estimatedMins
			if (diff <= 0) return 'text-green-600'
			return 'text-yellow-600'
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

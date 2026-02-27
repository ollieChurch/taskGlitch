<template>
	<Transition name="toast">
		<div
			v-if="visible"
			class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 font-rajdhani border border-border-visible bg-surface-raised shadow-lg"
			style="border-radius: var(--radius-card-sm);"
			role="alert"
			aria-live="polite"
		>
			<span class="text-text-heading text-sm font-semibold">{{ message }}</span>
			<button
				class="btn-themed bg-accent text-text-inverse px-3 py-1 text-sm font-semibold border border-accent transition-all"
				@click="$emit('action')"
			>
				{{ actionLabel }}
			</button>
			<button
				class="text-text-secondary hover:text-text-heading transition-colors ml-1"
				aria-label="Dismiss"
				@click="$emit('dismiss')"
			>
				<X :size="14" />
			</button>
		</div>
	</Transition>
</template>

<script>
import { X } from 'lucide-vue-next'

export default {
	name: 'Toast',
	components: { X },
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		message: {
			type: String,
			default: ''
		},
		actionLabel: {
			type: String,
			default: 'Undo'
		}
	},
	emits: ['action', 'dismiss']
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateY(10px);
}
</style>

<template>
	<dialog
		ref="dialogRef"
		class="backdrop:bg-black/70 shadow-xl p-0 w-full max-w-lg m-auto border border-accent-dim bg-transparent rounded-xl overflow-hidden"
		@close="onDialogClose"
	>
		<div class="depth-panel p-6">
			<!-- Header -->
			<div class="flex justify-between items-center mb-4" v-if="title || $slots.header">
				<slot name="header">
					<h3 class="text-xl font-semibold font-rajdhani text-text-heading">{{ title }}</h3>
				</slot>
				<button
					v-if="!hideHeaderClose"
					@click="close"
					class="text-text-secondary hover:text-accent text-2xl leading-none ml-4 transition-colors"
				>
					<X :size="20" />
				</button>
			</div>

			<!-- Body -->
			<div class="text-text-primary">
				<slot></slot>
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-2 mt-6" v-if="$slots.footer || showDefaultFooter">
				<slot name="footer" :ok="handleOk" :close="close">
					<button
						@click="close"
						class="btn-themed px-4 py-2 bg-surface-hover text-text-secondary border border-border-default hover:border-accent-dim font-rajdhani font-semibold transition-colors"
					>
						Cancel
					</button>
					<button
						@click="handleOk"
						class="btn-themed px-4 py-2 bg-accent text-text-inverse hover:brightness-110 font-rajdhani font-semibold transition-all"
					>
						OK
					</button>
				</slot>
			</div>
		</div>
	</dialog>
</template>

<script>
import { X } from 'lucide-vue-next'

export default {
	name: 'BaseModal',
	components: { X },
	props: {
		title: {
			type: String,
			default: ''
		},
		hideHeaderClose: {
			type: Boolean,
			default: false
		},
		showDefaultFooter: {
			type: Boolean,
			default: true
		},
		size: {
			type: String,
			default: 'md',
			validator: (val) => ['sm', 'md', 'lg'].includes(val)
		}
	},
	emits: ['show', 'ok', 'hide'],
	computed: {
		sizeClass() {
			const sizes = {
				sm: 'max-w-sm',
				md: 'max-w-lg',
				lg: 'max-w-2xl'
			}
			return sizes[this.size]
		}
	},
	methods: {
		show() {
			this.$refs.dialogRef.showModal()
			this.$emit('show')
		},
		close() {
			this.$refs.dialogRef.close()
		},
		handleOk() {
			this.$emit('ok')
		},
		onDialogClose() {
			this.$emit('hide')
		}
	},
	expose: ['show', 'close']
}
</script>

<style scoped>
dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.7);
}

dialog[open] {
	animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style>

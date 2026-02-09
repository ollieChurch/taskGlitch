<template>
	<dialog
		ref="dialogRef"
		class="backdrop:bg-black/50 rounded-lg shadow-xl p-0 w-full max-w-lg m-auto border-0"
		@close="onDialogClose"
	>
		<div class="bg-white rounded-lg p-6">
			<!-- Header -->
			<div class="flex justify-between items-center mb-4" v-if="title || $slots.header">
				<slot name="header">
					<h3 class="text-xl font-semibold font-rajdhani">{{ title }}</h3>
				</slot>
				<button
					v-if="!hideHeaderClose"
					@click="close"
					class="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
				>
					<i class="fas fa-times"></i>
				</button>
			</div>

			<!-- Body -->
			<div>
				<slot></slot>
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-2 mt-6" v-if="$slots.footer || showDefaultFooter">
				<slot name="footer" :ok="handleOk" :close="close">
					<button
						@click="close"
						class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-rajdhani font-semibold"
					>
						Cancel
					</button>
					<button
						@click="handleOk"
						class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-rajdhani font-semibold"
					>
						OK
					</button>
				</slot>
			</div>
		</div>
	</dialog>
</template>

<script>
export default {
	name: 'BaseModal',
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
	background-color: rgba(0, 0, 0, 0.5);
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

<template>
	<footer class="bg-surface-raised border-t border-border-default py-4 sm:mt-4">
		<p class="text-center text-sm text-text-secondary font-rajdhani">
			<span class="font-wallpoet">Task Glitch</span> Version: {{ appVersion }}
		</p>
	</footer>
</template>

<script>
import { useAppStore } from '@/stores/app'

export default {
	setup() {
		const store = useAppStore()
		return { store }
	},
	computed: {
		appVersion() {
			return this.store.appVersion
		}
	}
}
</script>

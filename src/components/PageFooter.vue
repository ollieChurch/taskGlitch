<template>
	<footer class="bg-white py-4 sm:mt-4">
		<p class="text-center text-sm text-gray-500 font-rajdhani">
			Task Glitch Version: {{ appVersion }}
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

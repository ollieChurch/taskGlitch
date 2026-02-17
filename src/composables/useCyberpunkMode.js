import { computed, watchEffect } from 'vue'
import { useAppStore } from '@/stores/app'

export function useCyberpunkMode() {
	const store = useAppStore()

	const isCyberpunk = computed(() => {
		return store.account?.settings?.display?.cyberpunkMode ?? false
	})

	watchEffect(() => {
		document.documentElement.classList.toggle('cyberpunk', isCyberpunk.value)
	})

	return { isCyberpunk }
}

<template>
	<footer class="bg-surface-raised border-t border-border-visible py-2 px-4">
		<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 max-w-screen-xl mx-auto">
			<p class="text-xs text-text-secondary font-rajdhani mb-0">
				<span class="font-wallpoet">Task Glitch</span>
				<span class="ml-1 opacity-60">v{{ appVersion }}</span>
			</p>
			<nav class="flex items-center gap-4" aria-label="Footer navigation">
				<button
					class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
					@click="openOnboarding()"
				>
					How it works
				</button>
				<button
					class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
					@click="openPatchNotes()"
				>
					What's new
				</button>
				<a
					href="mailto:feedback@taskglitch.app"
					class="text-xs text-text-secondary font-rajdhani hover:text-accent transition-colors"
				>
					Feedback
				</a>
			</nav>
		</div>
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
	},
	methods: {
		openOnboarding() {
			this.store.triggerOnboarding()
		},
		openPatchNotes() {
			this.store.triggerPatchNotes()
		}
	}
}
</script>

<template>
	<div class="m-0 p-3 bg-surface-overlay border-l-4 border-accent text-left w-full sticky top-0 z-50">
		<div class="mx-auto" style="max-width: 720px">
			<div class="flex justify-between items-start">
				<h5 class="font-bold font-rajdhani text-accent">{{ title }}</h5>
				<button
					v-if="dismissible"
					@click="$emit('dismiss')"
					class="ml-2 text-text-secondary hover:text-accent font-bold text-lg leading-none transition-colors"
				>
					<X :size="18" />
				</button>
			</div>
			<div class="flex justify-between flex-wrap">
				<p class="font-bold mb-0 font-rajdhani text-text-primary">
					{{ text }}
				</p>
				<a
					v-if="callToActionText"
					@click="$emit('callToActionClicked')"
					class="font-bold cursor-pointer font-rajdhani text-accent hover:text-accent/80 transition-colors"
				>
					{{ callToActionText }}
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import { X } from 'lucide-vue-next'

export default {
	name: 'NotificationBanner',
	components: { X },
	props: ['title', 'text', 'callToActionText', 'dismissible'],
	emits: ['callToActionClicked', 'dismiss']
}
</script>

<template>
	<div class="m-0 p-3 bg-yellow-400 text-left w-full sticky top-0 z-50">
		<div class="mx-auto" style="max-width: 575px">
			<div class="flex justify-between items-start">
				<h5 class="font-bold font-rajdhani">{{ title }}</h5>
				<button
					v-if="dismissible"
					@click="$emit('dismiss')"
					class="ml-2 text-black hover:text-gray-700 font-bold text-lg leading-none"
				>
					<i class="fas fa-times"></i>
				</button>
			</div>
			<div class="flex justify-between flex-wrap">
				<p class="font-bold mb-0 font-rajdhani">
					{{ text }}
				</p>
				<a
					v-if="callToActionText"
					@click="$emit('callToActionClicked')"
					class="font-bold cursor-pointer font-rajdhani"
				>
					{{ callToActionText }}
				</a>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NotificationBanner',
	props: ['title', 'text', 'callToActionText', 'dismissible'],
	emits: ['callToActionClicked', 'dismiss']
}
</script>

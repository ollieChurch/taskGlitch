<template>
	<div class="m-0 p-3 bg-yellow-400 text-left w-full">
		<div class="mx-auto" style="max-width: 575px">
			<h5 class="font-bold font-rajdhani">{{ title }}</h5>
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
	props: ['title', 'text', 'callToActionText'],
	emits: ['callToActionClicked']
}
</script>

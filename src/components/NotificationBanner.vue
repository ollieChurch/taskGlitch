<template>
	<div class="m-0 p-3 bg-warning text-left" style="width: 100%">
		<div class="mx-auto" style="max-width: 575px">
			<b-card-title class="font-weight-bold">{{ title }}</b-card-title>
			<div class="d-flex justify-content-between flex-wrap">
				<b-card-text class="font-weight-bold mb-0">
					{{ text }}
				</b-card-text>
				<a
					v-if="callToActionText"
					@click="$emit('callToActionClicked')"
					class="font-weight-bold"
					style="cursor: pointer"
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
		props: ['title', 'text', 'callToActionText']
	}
</script>

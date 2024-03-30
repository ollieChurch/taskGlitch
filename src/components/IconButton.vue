<template>
	<div
		class="col d-flex flex-column justify-content-between align-items-center mb-3 gap-3"
	>
		<b-btn
			@click="handleClick()"
			:variant="variant"
			class="font-weight-bold py-2 px-4"
			style="font-size: 1.75rem"
		>
			<b-icon :icon="icon"></b-icon>
		</b-btn>
		<b-card-title>{{ label }}</b-card-title>
	</div>
</template>

<script>
export default {
	props: ["variant", "icon", "label"],

	methods: {
		handleClick() {
			this.$emit('buttonClicked')
		}
	}
}
</script>

<template>
	<div class="content-card depth-panel pt-2 pb-5 px-4 sm:my-5 sm:p-5 mx-auto"
		:class="{ 'content-card--narrow': narrow }">
		<slot></slot>
	</div>
</template>

<script>
export default {
	name: 'ContentCard',
	props: {
		narrow: {
			type: Boolean,
			default: false
		}
	}
}
</script>

<style scoped>
.content-card {
	max-width: 575px;
	min-height: 100vh;
	position: relative;
	border: 1px solid var(--color-border-visible);
}

@media (min-width: 575px) {
	.content-card {
		min-height: unset;
		border-radius: var(--radius-card);
	}
}

@media (min-width: 768px) {
	.content-card {
		max-width: none;
		margin-left: 1.5rem;
		margin-right: 1.5rem;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.content-card--narrow {
		max-width: 540px;
		margin-left: auto;
		margin-right: auto;
	}
}

@media (min-width: 1280px) {
	.content-card {
		margin-left: 2.5rem;
		margin-right: 2.5rem;
	}

	.content-card--narrow {
		margin-left: auto;
		margin-right: auto;
	}
}
</style>

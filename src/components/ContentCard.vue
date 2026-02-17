<template>
	<div class="content-card depth-panel pt-2 pb-5 px-4 sm:my-5 sm:p-5 mx-auto">
		<slot></slot>
	</div>
</template>

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
		max-width: 720px;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
}
</style>

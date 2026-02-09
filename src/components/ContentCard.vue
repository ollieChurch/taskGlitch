<template>
	<div class="content-card bg-white pt-2 pb-5 px-4 sm:my-5 sm:p-5 mx-auto">
		<slot></slot>
	</div>
</template>

<style scoped>
.content-card {
	max-width: 575px;
	min-height: 100vh;
}

@media (min-width: 575px) {
	.content-card {
		min-height: unset;
		border-radius: 0.25rem;
	}
}
</style>

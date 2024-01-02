<template>
    <div class="container content-card bg-white pt-2 pb-5 px-4 my-sm-5 p-sm-5">
        <slot></slot>
    </div>
</template>

<style scoped>
    .content-card {
        max-width: 575px;
		min-height: 100vh;
    }

	@media(min-width:575px) {
		.content-card {
			min-height: unset;
			border-radius: 0.25rem;
		}
	}
</style>
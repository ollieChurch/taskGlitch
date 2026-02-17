<template>
	<div class="space-y-4">
		<div
			v-for="n in lines"
			:key="n"
			class="skeleton-line rounded"
			:style="{ width: getLineWidth(n), height: height }"
		></div>
	</div>
</template>

<script>
export default {
	name: 'SkeletonLoader',

	props: {
		lines: {
			type: Number,
			default: 3
		},
		height: {
			type: String,
			default: '1rem'
		}
	},

	methods: {
		getLineWidth(index) {
			// Vary widths to look more natural
			const widths = ['100%', '85%', '70%', '90%', '75%']
			return widths[(index - 1) % widths.length]
		}
	}
}
</script>

<style scoped>
.skeleton-line {
	background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-surface-overlay) 50%, var(--color-surface-hover) 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
</style>

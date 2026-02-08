<template>
	<div class="flex flex-col justify-between items-center mb-3 gap-3">
		<button
			@click="handleClick()"
			:class="variantClass"
			class="font-bold py-2 px-4 rounded text-3xl"
		>
			<i :class="iconClass"></i>
		</button>
		<h5 class="font-rajdhani font-semibold">{{ label }}</h5>
	</div>
</template>

<script>
const variantMap = {
	primary: 'bg-blue-600 text-white hover:bg-blue-700',
	success: 'bg-green-600 text-white hover:bg-green-700',
	danger: 'bg-red-600 text-white hover:bg-red-700',
	warning: 'bg-yellow-400 text-black hover:bg-yellow-500',
	info: 'bg-cyan-500 text-white hover:bg-cyan-600',
	light: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

const iconMap = {
	'stars': 'fas fa-star',
	'plus-lg': 'fas fa-plus',
	'calendar': 'fas fa-calendar',
	'check': 'fas fa-check'
}

export default {
	props: ['variant', 'icon', 'label'],
	emits: ['buttonClicked'],
	computed: {
		variantClass() {
			return variantMap[this.variant] || variantMap.primary
		},
		iconClass() {
			return iconMap[this.icon] || `fas ${this.icon}`
		}
	},
	methods: {
		handleClick() {
			this.$emit('buttonClicked')
		}
	}
}
</script>

<template>
	<div class="flex-1">
		<button
			@click="handleClick()"
			:class="variantClass"
			class="w-full font-bold py-3 px-4 rounded text-lg font-rajdhani"
		>
			<i :class="iconClass" class="mr-2"></i>
			{{ label }}
		</button>
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

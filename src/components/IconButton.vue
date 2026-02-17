<template>
	<div class="flex-1">
		<button
			@click="handleClick()"
			:class="variantClass"
			class="btn-themed w-full font-bold py-2 px-3 text-sm font-rajdhani uppercase tracking-wider transition-all"
		>
			<component :is="iconComponent" :size="16" class="mr-1.5 inline-block" />
			{{ label }}
		</button>
	</div>
</template>

<script>
import { markRaw } from 'vue'
import { Star, Plus, Calendar, Check } from 'lucide-vue-next'

const variantMap = {
	primary: 'bg-accent text-text-inverse hover:brightness-110',
	success: 'bg-app-success text-text-inverse hover:brightness-110',
	danger: 'bg-app-danger text-white hover:brightness-110',
	warning: 'bg-app-warning text-text-inverse hover:brightness-110',
	info: 'bg-app-info text-white hover:brightness-110',
	light: 'bg-surface-hover text-text-primary border border-border-default hover:border-accent-dim'
}

const iconMap = {
	'stars': markRaw(Star),
	'plus-lg': markRaw(Plus),
	'calendar': markRaw(Calendar),
	'check': markRaw(Check)
}

export default {
	components: { Star, Plus, Calendar, Check },
	props: ['variant', 'icon', 'label'],
	emits: ['buttonClicked'],
	computed: {
		variantClass() {
			return variantMap[this.variant] || variantMap.primary
		},
		iconComponent() {
			return iconMap[this.icon] || null
		}
	},
	methods: {
		handleClick() {
			this.$emit('buttonClicked')
		}
	}
}
</script>

<template>
	<div class="md:flex md:flex-col md:min-h-0 md:flex-1">
		<div class="flex border-b border-border-default shrink-0" :class="fill ? 'w-full' : ''">
			<button
				v-for="(tab, index) in tabs"
				:key="index"
				@click="activeTab = index"
				:class="[
					'px-4 py-2 font-bold font-rajdhani transition-colors text-xs uppercase tracking-widest border-b-2 -mb-px',
					fill ? 'flex-1 text-center' : '',
					activeTab === index
						? 'border-accent text-accent'
						: 'border-transparent text-text-secondary hover:text-text-primary'
				]"
			>
				{{ tab.title }}
			</button>
		</div>
		<div class="mt-2 md:flex-1 md:min-h-0 md:flex md:flex-col">
			<slot></slot>
		</div>
	</div>
</template>

<script>
import { provide, ref } from 'vue'

export default {
	name: 'BaseTabs',
	props: {
		fill: {
			type: Boolean,
			default: false
		},
		pills: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const activeTab = ref(0)
		const tabs = ref([])

		function registerTab(tab) {
			tabs.value.push(tab)
			return tabs.value.length - 1
		}

		provide('tabsActiveTab', activeTab)
		provide('tabsRegister', registerTab)

		return { activeTab, tabs }
	}
}
</script>

<template>
	<div>
		<div class="flex" :class="fill ? 'w-full' : ''">
			<button
				v-for="(tab, index) in tabs"
				:key="index"
				@click="activeTab = index"
				:class="[
					'px-4 py-2 font-semibold font-rajdhani transition-colors rounded-full text-sm',
					fill ? 'flex-1 text-center' : '',
					activeTab === index
						? 'bg-blue-600 text-white'
						: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
				]"
			>
				{{ tab.title }}
			</button>
		</div>
		<div class="mt-2">
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

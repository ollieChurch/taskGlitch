<template>
	<div v-show="isActive" class="md:flex md:flex-col md:flex-1 md:min-h-0">
		<slot></slot>
	</div>
</template>

<script>
import { inject, ref, computed, onMounted } from 'vue'

export default {
	name: 'BaseTab',
	props: {
		title: {
			type: String,
			required: true
		}
	},
	setup(props) {
		const activeTab = inject('tabsActiveTab')
		const registerTab = inject('tabsRegister')
		const tabIndex = ref(-1)

		onMounted(() => {
			tabIndex.value = registerTab({ title: props.title })
		})

		const isActive = computed(() => {
			return tabIndex.value === activeTab.value
		})

		return { isActive }
	}
}
</script>

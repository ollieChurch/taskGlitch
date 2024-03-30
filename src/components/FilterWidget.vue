<template>
	<div class="mb-4">
		<b-card-title class="text-start font-weight-bold">
			{{ title }}
		</b-card-title>
		<task-card
			v-for="task in tasks"
			:key="`filterWidget-task-${task.id}`"
			:task="task"
			class="mt-3"
		/>
	</div>
</template>

<script>
	import TaskCard from './TaskCard.vue'

	export default {
		props: ['title', 'tasks'],

		components: {
			TaskCard
		}
	}
</script>

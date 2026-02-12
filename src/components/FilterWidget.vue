<template>
	<div class="mb-4">
		<h5 class="text-left font-bold font-rajdhani">
			{{ title }}
		</h5>
		<task-card
			v-for="task in tasks"
			:key="`filterWidget-task-${task.id}`"
			:task="task"
			@editTask="$emit('editTask')"
			class="mt-3"
		/>
	</div>
</template>

<script>
import TaskCard from './TaskCard.vue'

export default {
	props: ['title', 'tasks'],
	emits: ['editTask'],
	components: {
		TaskCard
	}
}
</script>

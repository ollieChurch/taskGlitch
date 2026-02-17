<template>
	<div>
		<div class="mb-4">
			<div class="flex justify-center sm:justify-start mb-3">
				<glitch-emblem :size="80" />
			</div>
			<h1 class="mb-2 text-center sm:text-left font-rajdhani font-bold text-2xl text-text-heading">
				Let's get to work!
			</h1>
			<p class="mb-0 text-center sm:text-left font-rajdhani text-text-primary">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Nullam a tortor sed enim rutrum molestie in at metus. Proin
				ac accumsan ipsum, ac pellentesque odio. Aliquam mattis erat
				tellus.
			</p>
		</div>
		<div>
			<button
				class="btn-themed bg-accent text-text-inverse font-bold py-2 px-4 hover:brightness-110 font-rajdhani transition-all"
				@click="$emit('createSchedule')"
			>
				Glitch It!
			</button>
		</div>
	</div>
</template>

<script>
import GlitchEmblem from '@/components/GlitchEmblem.vue'

export default {
	emits: ['createSchedule'],
	components: {
		GlitchEmblem
	}
}
</script>

<template>
	<div>
		<div class="mb-4">
			<div class="flex justify-center sm:justify-start mb-3">
				<img :src="glitchImg" class="w-24" alt="a cartoon robot" />
			</div>
			<h1 class="mb-2 text-center sm:text-left font-rajdhani font-bold text-2xl">
				Let's get to work!
			</h1>
			<p class="mb-0 text-center sm:text-left font-rajdhani">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				Nullam a tortor sed enim rutrum molestie in at metus. Proin
				ac accumsan ipsum, ac pellentesque odio. Aliquam mattis erat
				tellus.
			</p>
		</div>
		<div>
			<button
				class="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 font-rajdhani"
				@click="$emit('createSchedule')"
			>
				Glitch It!
			</button>
		</div>
	</div>
</template>

<script>
import glitch from '@/assets/glitch-small.png'

export default {
	emits: ['createSchedule'],
	data() {
		return {
			glitchImg: glitch
		}
	}
}
</script>

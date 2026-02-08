<template>
	<div>
		<div class="flex flex-wrap items-center mb-4">
			<h1 class="mb-0 text-center sm:text-left order-2 sm:order-1 pt-3">
				Let's get to work!
			</h1>
			<div class="w-full order-3 sm:order-2 sm:w-9/12">
				<p class="mb-0 sm:text-left">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					Nullam a tortor sed enim rutrum molestie in at metus. Proin
					ac accumsan ipsum, ac pellentesque odio. Aliquam mattis erat
					tellus.
				</p>
			</div>
			<div class="w-full px-5 py-3 sm:py-0 sm:px-0 order-1 sm:order-3 sm:w-3/12">
				<img :src="glitchImg" class="w-full" alt="a cartoon robot" />
			</div>
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

<template>
    <div>
        <b-row class="align-items-center mb-4">
            <h1
                class="mb-0 text-start order-2 order-sm-1 text-sm-start text-center pt-3"
            >
                Let's get to work!
            </h1>
            <b-col class="col-12 order-3 order-sm-2 col-sm-9">
                <p class="mb-0 text-sm-start">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam a tortor sed enim rutrum molestie in at metus. Proin
                    ac accumsan ipsum, ac pellentesque odio. Aliquam mattis erat
                    tellus.
                </p>
            </b-col>
            <b-col
                class="col-12 px-5 py-3 py-sm-0 px-sm-0 order-1 order-sm-3 col-sm-3"
            >
                <b-img :src="glitchImg" fluid alt="a cartoon robot"></b-img>
            </b-col>
        </b-row>
		<b-row>
			<b-btn variant="primary" @click="$emit('createSchedule')">Glitch It!</b-btn>
		</b-row>
    </div>
</template>

<script>
    import glitch from '@/assets/glitch-small.png'

    export default {
        data() {
            return {
                glitchImg: glitch
            }
        }
    }
</script>

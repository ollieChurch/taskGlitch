<template>
    <b-form ref="scheduleSetUpForm" class="text-left" @submit="onSubmit">
        <b-form-group label="Date" label-for="sessionDate" class="form-input">
            <b-form-datepicker
                id="sessionDate"
                v-model="sessionDate"
                :min="new Date()"
                reset-button
            ></b-form-datepicker>
        </b-form-group>
        <div class="d-flex justify-content-between">
            <b-form-group
                label="From"
                label-for="fromTime"
                class="form-input col-6 pe-2 ps-0"
            >
                <b-form-timepicker
                    id="fromTime"
                    v-model="fromTime"
                    locale="en"
                    now-button
                    :hour12="false"
                ></b-form-timepicker>
            </b-form-group>
            <b-form-group
                label="To"
                label-for="toTime"
                class="form-input col-6 ps-2 pe-0"
            >
                <b-form-timepicker
                    id="toTime"
                    v-model="toTime"
                    locale="en"
                    reset-button
                    :hour12="false"
                ></b-form-timepicker>
            </b-form-group>
        </div>
        <b-form-group
            label="Categories To Include"
            label-for="categoriesToInclude"
            class="form-input"
        >
            <multiselect
                v-model="categoriesToInclude"
                :options="getCategories"
                multiple
                :allow-empty="false"
                placeholder="select categories"
                open-direction="bottom"
                :searchable="false"
                hide-selected
                :close-on-select="false"
            ></multiselect>
        </b-form-group>
        <b-button type="submit" variant="primary">Schedule</b-button>
    </b-form>
</template>

<script>
    import { getDatabase, ref, set } from 'firebase/database'
    import { mapGetters } from 'vuex'
    import Multiselect from 'vue-multiselect'

    export default {
        components: {
            Multiselect
        },

        data() {
            return {
                sessionDate: new Date(),
                fromTime: new Date().toLocaleTimeString(),
                toTime: null,
                categoriesToInclude: null
            }
        },

        created() {
            this.categoriesToInclude = this.getCategories
        },

        computed: {
            ...mapGetters(['getCategories', 'getPrioritisedTasks'])
        },

        methods: {
            onSubmit(event) {
                event.preventDefault()
                const filteredTasks = this.getPrioritisedTasks.filter(x =>
                    this.categoriesToInclude.includes(x.category)
                )

                const sessionFromDate = new Date(this.sessionDate)
                const sessionToDate = new Date(this.sessionDate)

                if (!this.toTime || this.toTime.substring(0, 2) < this.fromTime.substring(0, 2)) {
                    sessionToDate.setDate(sessionToDate.getDate() + 1)
                }

                const from = new Date(`${sessionFromDate.toDateString()} ${this.fromTime}`)
                const to = new Date(`${sessionToDate.toDateString()} ${this.toTime}`)

                var sessionInMins = Math.floor(
                    (to.getTime() - from.getTime()) / 1000 / 60
                )

                console.log('session length in mins: ', sessionInMins)

                const schedule = []
                let totalTaskTime = 0
                let currentTaskIndex = 0

                while (
                    totalTaskTime < sessionInMins &&
                    currentTaskIndex < filteredTasks.length
                ) {
                    const task = filteredTasks[currentTaskIndex]
                    const taskLength = task.sizing

                    if (totalTaskTime + taskLength <= sessionInMins) {
                        schedule.push(task)
                        totalTaskTime += taskLength
                    }

                    currentTaskIndex++
                }

                console.log('schedule length in mins: ', totalTaskTime)

                const scheduleDetails = {
                    start: from.toString(),
                    finish: to.toString(),
                    categoriesToInclude: this.categoriesToInclude,
                    schedule: schedule
                }

                this.saveToDatabase(scheduleDetails)
            },

            saveToDatabase(schedule) {
                const db = getDatabase(this.$store.state.app)
                const scheduleRef = ref(
                    db,
                    `schedule/${this.$store.state.user.uid}`
                )

                set(scheduleRef, schedule).then(() => {
                    console.log('updated schedule: ', schedule)
                })
            }
        }
    }
</script>

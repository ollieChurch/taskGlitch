<template>
    <div>
        <content-card>
            <glitch-explained
                v-if="!schedule"
                @createSchedule="openScheduleSetUp()"
            />
            <div v-else>
                <div class="d-flex mb-4">
                    <b-btn @click="openScheduleSetUp()" variant="primary">
                        New
                    </b-btn>
                    <b-btn
                        @click="deleteSchedule()"
                        variant="danger"
                        class="mx-2"
                    >
                        Remove
                    </b-btn>
                    <b-btn @click="reschedule()" variant="warning">
                        Reschedule
                    </b-btn>
                </div>
                <task-schedule />
            </div>
        </content-card>
        <schedule-set-up-modal />
    </div>
</template>

<script>
    import ScheduleSetUpModal from '@/components/ScheduleSetUpModal.vue'
    import GlitchExplained from '@/components/GlitchExplained.vue'
    import TaskSchedule from '@/components/TaskSchedule.vue'
    import ContentCard from '@/components/ContentCard.vue'

    export default {
        name: 'ScheduleView',

        components: {
            ContentCard,
            ScheduleSetUpModal,
            GlitchExplained,
            TaskSchedule
        },

        created() {
            this.pageCheck()
        },

        computed: {
            schedule() {
                return this.$store.state.schedule
			},

			maintainFinish() {
				return this.$store.state.settings.maintainFinishTimeWhenRescheduling
			}
        },

        methods: {
            openScheduleSetUp() {
                this.$bvModal.show('scheduleSetUpModal')
            },

            deleteSchedule() {
                this.saveScheduleToDatabase({})
            },

            reschedule() {
                const remainingTasks = this.schedule.tasks.filter(
                    x => x.completed === false
				)

                const calculatedTimes = this.getScheduleTimes(
                    this.schedule.start,
                    new Date().toLocaleTimeString(),
					this.maintainFinish ? new Date(this.schedule.finish).toLocaleTimeString() : null,
					this.maintainFinish ? this.schedule.finish : null
                )

                const scheduleDetails = {
                    categoriesToInclude: this.schedule.categoriesToInclude,
                    tasks: this.getScheduleTasks(
                        remainingTasks,
                        calculatedTimes.sessionInMins
                    ).tasks,
                    start: calculatedTimes.start.toString(),
                    finish: calculatedTimes.finish.toString()
                }

                this.saveScheduleToDatabase(scheduleDetails)
            }
        }
    }
</script>

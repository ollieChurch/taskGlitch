<template>
    <div>
        <content-card>
            <schedule-set-up />
        </content-card>

        <content-card>
            <b-card-title>Schedule</b-card-title>
            <div
                v-for="task in scheduleDetails.tasks"
                :key="`schedule-${task.id}`"
                class="row align-items-center px-0 mx-0"
            >
                <h1 class="col-3 mb-0 px-0 text-left">{{ task.time }}</h1>
                <b-card class="my-2 p-2 task-card col" no-body>
                    <div class="row align-items-center mx-0">
                        <b-card-title
                            class="text-start mb-0 ps-0 pe-2 col-10"
                            :class="task.completed ? 'completed-task' : ''"
                        >
                            {{ task.name }}
                        </b-card-title>
                        <b-button
                            class="col-2"
                            :variant="task.completed ? 'warning' : 'success'"
                            @click="toggleCompleted(task)"
                        >
                            <b-icon
                                :icon="
                                    task.completed
                                        ? 'arrow-counterclockwise'
                                        : 'check-circle'
                                "
                            ></b-icon>
                        </b-button>
                    </div>
                </b-card>
            </div>
        </content-card>

        <content-card>
            <b-card-title>All Backlog</b-card-title>
            <b-card
                v-for="task in getPrioritisedTasks"
                :key="`task-${task.id}`"
                class="my-2 p-2 task-card"
                no-body
            >
                <div class="row align-items-center">
                    <div class="col">
                        <b-card-title class="text-start mb-1">
                            {{ task.name }} - score: {{ task.score }}
                        </b-card-title>
                        <div class="row task-details">
                            <b-card-text class="col text-start mb-0">
                                {{ task.priority }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.sizing }}
                            </b-card-text>
                            <b-card-text class="col-auto text-start mb-0">
                                {{
                                    task.targetDateTime
                                        ? task.targetDateTime
                                        : 'no target'
                                }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.deadline }}
                                {{ task.isHardDeadline ? '!' : '' }}
                            </b-card-text>
                        </div>
                    </div>
                </div>
            </b-card>
        </content-card>
    </div>
</template>

<script>
    import ScheduleSetUp from '@/components/ScheduleSetUp.vue'
    import ContentCard from '@/components/ContentCard.vue'
    import { mapGetters } from 'vuex'

    export default {
        name: 'ScheduleView',

        components: { ContentCard, ScheduleSetUp },

        created() {
            this.pageCheck()
            this.setScheduleDetails()
        },

        data() {
            return {
                scheduleDetails: {}
            }
        },

        watch: {
            storedSchedule() {
                this.setScheduleDetails()
            }
        },

        computed: {
            ...mapGetters(['getPrioritisedTasks']),

            storedSchedule() {
                return this.$store.state.schedule
            }
        },

        methods: {
            setScheduleDetails() {
                const scheduleDetails = this.storedSchedule

                if (scheduleDetails.tasks) {
                    const startDateTime = new Date(scheduleDetails.start)
                    let taskTime = new Date(startDateTime)

                    scheduleDetails.tasks.forEach(task => {
                        task.time = taskTime.toLocaleTimeString([], {
                            timeStyle: 'short'
                        })
                        task.date = taskTime.toLocaleDateString()
                        taskTime = new Date(
                            taskTime.setMinutes(
                                taskTime.getMinutes() + task.sizing
                            )
                        )

                        task.completed = false
                    })
                }

                this.scheduleDetails = scheduleDetails
            },

            toggleCompleted(task) {
                const list = task.completed ? 'tasks' : 'completed'

                const taskIndex = this.scheduleDetails.tasks.findIndex(
                    x => x.id == task.id
                )
                const scheduleDetails = this.scheduleDetails
                scheduleDetails.tasks[taskIndex].completed =
                    !scheduleDetails.tasks[taskIndex].completed

                this.scheduleDetails = scheduleDetails

                console.log(this.scheduleDetails.tasks)

                this.moveTask(task, list)
            }
        }
    }
</script>

<style scoped>
    .completed-task {
        text-decoration: line-through;
        opacity: 0.5;
    }
</style>

<template>
    <div>
        <content-card>
            <schedule-set-up />
        </content-card>

        <content-card>
            <b-card-title>Schedule</b-card-title>
            <b-card
                v-for="task in schedule.schedule"
                :key="`schedule-${task.id}`"
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
        },

        computed: {
            ...mapGetters(['getPrioritisedTasks']),

            schedule() {
                return this.$store.state.schedule
            }
        }
    }
</script>

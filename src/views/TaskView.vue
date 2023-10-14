<template>
    <div>
        <content-card>
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h1 class="text-left mb-0">Tasks</h1>
                <b-btn @click="addTask()">Add Task</b-btn>
            </div>
            <b-tabs pills fill class="pt-2">
                <b-tab title="Backlog">
                    <div class="pt-2">
                        <TaskCard
                            v-for="task in tasks"
                            :key="`task-${task.id}`"
                            :task="task"
                        />
                    </div>
                </b-tab>
                <b-tab title="Completed">
                    <div class="pt-2">
                        <TaskCard
                            v-for="task in completed"
                            :key="`completed-${task.id}`"
                            :task="task"
                        />
                    </div>
                </b-tab>
            </b-tabs>
        </content-card>
        <task-modal />
    </div>
</template>

<script>
    import ContentCard from '@/components/ContentCard.vue'
    import TaskModal from '@/components/TaskModal.vue'
    import TaskCard from '@/components/TaskCard.vue'

    export default {
        components: {
            ContentCard,
            TaskModal,
            TaskCard
        },

        created() {
            this.pageCheck()
        },

        computed: {
            tasks() {
                return this.$store.state.tasks
            },

            completed() {
                return this.$store.state.completed
            }
        },

        methods: {
            editTask(task) {
                this.$store.commit('setTaskToPatch', task)
                this.$bvModal.show('taskModal')
            },

            addTask() {
                this.$bvModal.show('taskModal')
            }
        }
    }
</script>

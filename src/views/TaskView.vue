<template>
    <div>
        <content-card>
            <h1>Task Backlog</h1>
            <b-card
                v-for="task in tasks"
                :key="`task-${task.id}`"
                class="my-2 p-2 task-card"
                no-body
            >
                <b-dropdown
                    id="dropdown-dropleft"
                    right
                    size="md"
                    variant="none"
                    no-caret
                    text="..."
                >
                    <b-dropdown-item @click="editTask(task)">
                        Edit
                    </b-dropdown-item>
                    <b-dropdown-item @click="removeTask(task, 'tasks')">
                        Delete
                    </b-dropdown-item>
                </b-dropdown>
                <div class="row align-items-center">
                    <div class="col-auto pe-1">
                        <b-btn
                            class="complete-btn"
                            @click="moveTask(task, 'completed')"
                        ></b-btn>
                    </div>
                    <div class="col">
                        <b-card-title class="text-start mb-1">
                            {{ task.name }}
                        </b-card-title>
                        <div class="row task-details">
                            <b-card-text class="col text-start mb-0">
                                {{ task.priority }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.sizing }}
                            </b-card-text>
                            <b-card-text class="col-auto text-start mb-0">
                                {{ task.targetDateTime ?? 'no target' }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.deadline }}
                            </b-card-text>
                        </div>
                    </div>
                </div>
            </b-card>
        </content-card>

        <content-card>
            <h1>Completed Tasks</h1>
            <b-card
                v-for="task in completed"
                :key="`task-${task.id}`"
                class="my-2 pt-2 task-card"
            >
                <b-dropdown
                    id="dropdown-dropleft"
                    right
                    size="md"
                    variant="none"
                    no-caret
                    text="..."
                >
                    <b-dropdown-item @click="moveTask(task, 'tasks')">
                        Move to Backlog
                    </b-dropdown-item>
                    <b-dropdown-item @click="removeTask(task, 'completed')">
                        Delete
                    </b-dropdown-item>
                </b-dropdown>
                <div class="row align-items-center">
                    <div class="col-auto pe-1">
                        <b-btn
                            class="complete-btn"
                            @click="moveTask(task, 'tasks')"
                        ></b-btn>
                    </div>
                    <div class="col">
                        <b-card-title class="text-start mb-1">
                            {{ task.name }}
                        </b-card-title>
                        <div class="row task-details">
                            <b-card-text class="col text-start mb-0">
                                {{ task.priority }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.sizing }}
                            </b-card-text>
                            <b-card-text class="col-auto text-start mb-0">
                                {{ task.targetDateTime ?? 'no target' }}
                            </b-card-text>
                            <b-card-text class="col text-start mb-0">
                                {{ task.deadline }}
                            </b-card-text>
                        </div>
                    </div>
                </div>
            </b-card>
        </content-card>
        <task-modal />
    </div>
</template>

<script>
    import { getDatabase, ref, set, remove } from 'firebase/database'
    import ContentCard from '@/components/ContentCard.vue'
    import TaskModal from '@/components/TaskModal.vue'

    export default {
        components: {
            ContentCard,
            TaskModal
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

            removeTask(task, list) {
                const db = getDatabase(this.$store.state.app)
                const listRef = ref(
                    db,
                    `${list}/${this.$store.state.user.uid}/${task.id}`
                )

                remove(listRef).then(() => {
                    console.log(`removed from ${list}: `, task)
                })
            },

            moveTask(task, list) {
                const db = getDatabase(this.$store.state.app)

                const listRef = ref(
                    db,
                    `${list}/${this.$store.state.user.uid}/${task.id}`
                )

                const removeFromList =
                    list === 'completed' ? 'tasks' : 'completed'
                task.completedDateTime =
                    list === 'completed' ? new Date().toLocaleString() : null

                set(listRef, task).then(() => {
                    this.removeTask(task, removeFromList)
                    console.log('moved task: ', task)
                })
            }
        }
    }
</script>

<style scoped>
    .task-card {
        position: relative;
    }
    .complete-btn {
        width: 25px;
        aspect-ratio: 1;
        background: unset;
    }

    .task-details {
        width: 100%;
    }

    #dropdown-dropleft {
        position: absolute;
        top: -0.5em;
        right: 0;
    }
</style>

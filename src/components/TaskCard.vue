<template>
    <b-card class="my-3 py-2 ps-5 pe-4 task-card" no-body>
        <div
            :class="`
                        priority-icon 
                        text-center
                        text-white
                        bg-${
                            task.completedDateTime
                                ? 'success'
                                : priorityIcons[task.priority].color
                        }
                    `"
        >
            <i
                :class="`
                            fas
                            fa-lg 
                            ${
                                task.completedDateTime
                                    ? 'fa-check-circle'
                                    : priorityIcons[task.priority].icon
                            }
                        `"
            ></i>
        </div>
        <div
            :class="`row align-items-center ${
                task.completedDateTime ? 'opacity-75' : ''
            }`"
        >
            <div class="col-10 pe-4">
                <b-card-title
                    :class="`text-start mb-1 ${
                        task.completedDateTime
                            ? 'text-decoration-line-through'
                            : ''
                    }`"
                >
                    {{ task.name }}
                    <span v-if="debug"> - {{ task.score }}</span>
                </b-card-title>
                <div v-if="task.completedDateTime" class="row task-details">
                    <b-link
                        class="col-sm-auto text-start mb-0"
                        @click="editTask(task)"
                    >
                        <i class="fas fa-edit"></i>
                    </b-link>
                    <b-card-text class="col-sm-auto text-start mb-0">
                        <i class="fas fa-check-circle"></i>
                        {{
                            new Date(task.completedDateTime).toLocaleDateString(
                                'en-uk',
                                {
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'short'
                                }
                            )
                        }}
                    </b-card-text>
                </div>
                <div v-else class="row task-details">
                    <b-link
                        class="col-sm-auto text-start mb-0"
                        @click="editTask(task)"
                    >
                        <i class="fas fa-edit"></i>
                    </b-link>
                    <b-card-text class="col-sm-auto text-start mb-0">
                        <i class="fas fa-stopwatch"></i>
                        {{ task.sizing }} mins
                    </b-card-text>
                    <b-card-text
                        class="col-sm text-start mb-0"
                        v-if="task.targetDateTime"
                    >
                        <i
                            :class="`fas ${
                                task.isHardDeadline
                                    ? 'fa-exclamation-circle'
                                    : 'fa-bullseye'
                            }`"
                        ></i>
                        {{
                            new Date(task.targetDateTime).toLocaleDateString(
                                'en-uk',
                                {
                                    day: 'numeric',
                                    year: 'numeric',
                                    month: 'short'
                                }
                            )
                        }}
                    </b-card-text>
                </div>
            </div>
            <div class="col-2">
                <b-button
                    variant="light"
                    class="complete-btn border"
                    @click="handleMainAction(task)"
                >
                    <b-icon
                        :icon="
                            task.completedDateTime
                                ? 'arrow-counterclockwise'
                                : 'check-circle'
                        "
                    ></b-icon>
                </b-button>
            </div>
        </div>
    </b-card>
</template>

<script>
    export default {
        props: ['task'],

        data() {
            return {
                priorityIcons: [
                    {
                        icon: 'fa-fire',
                        color: 'danger'
                    },
                    {
                        icon: 'fa-thermometer-three-quarters',
                        color: 'warning'
                    },
                    {
                        icon: 'fa-thermometer-half',
                        color: 'success'
                    },
                    {
                        icon: 'fa-thermometer-quarter',
                        color: 'info'
                    }
                ]
            }
        },

        computed: {
            debug() {
                return this.$store.state.debug
            }
        },

        methods: {
            editTask(task) {
                this.$store.commit('setTaskToPatch', task)
                this.$bvModal.show('taskModal')
            },

            handleMainAction(task) {
                const moveTo = task.completedDateTime ? 'tasks' : 'completed'
                this.moveTask(task, moveTo)
            }
        }
    }
</script>

<style scoped>
    .task-card {
        position: relative;
    }

    .complete-btn {
        width: 50px;
        text-align: center;
        aspect-ratio: 1;
        padding: 0;
    }

    .task-details {
        width: 100%;
    }

    .priority-icon {
        position: absolute;
        top: -7px;
        left: -7px;
        aspect-ratio: 1;
        width: 40px;
        padding-top: 0.5em;
        border-top-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
</style>

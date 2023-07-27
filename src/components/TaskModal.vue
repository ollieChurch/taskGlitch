<template>
    <b-modal
        id="taskModal"
        title="Add a Task"
        @show="resetModal"
        @ok="handleOk"
    >
        <b-form>
            <b-form-group
                label="Task"
                label-for="task"
                invalid-feedback="this is invalid input"
                :state="valid.task"
                class="form-input"
            >
                <b-form-input
                    id="task"
                    v-model="task.name"
                    :state="valid.task"
                    trim
                    autocomplete="off"
                ></b-form-input>
            </b-form-group>
            <div class="d-flex justify-content-between">
                <b-form-group
                    label="Priority"
                    label-for="priority"
                    invalid-feedback="this is invalid input"
                    :state="valid.priority"
                    class="form-input col-6 pe-2"
                >
                    <b-form-select
                        id="priority"
                        v-model="task.priority"
                        :options="priorityOptions"
                        :state="valid.priority"
                        class="form-control"
                        size="lg"
                    >
                    </b-form-select>
                </b-form-group>
                <b-form-group
                    label="Size"
                    label-for="sizing"
                    invalid-feedback="this is invalid input"
                    :state="valid.sizing"
                    class="form-input col-6 ps-2"
                >
                    <b-form-select
                        id="sizing"
                        v-model="task.sizing"
                        :options="sizingOptions"
                        :state="valid.sizing"
                        class="form-control"
                        size="lg"
                    >
                    </b-form-select>
                </b-form-group>
            </div>

            <b-form-group
                label="Category"
                label-for="category"
                invalid-feedback="this is invalid input"
                :state="valid.category"
                class="form-input"
            >
                <b-form-input
                    id="category"
                    v-model="task.category"
                    :state="valid.category"
                    list="tags"
                    trim
                    autocomplete="off"
                ></b-form-input>
                <datalist id="tags" autocomplete="false">
                    <option
                        v-for="(category, index) in getCategories"
                        :key="`${index}-${category}`"
                    >
                        {{ category }}
                    </option>
                </datalist>
            </b-form-group>
            <div class="d-flex justify-content-between">
                <b-form-group
                    label="Target Date"
                    label-for="targetDate"
                    class="form-input col-7 pe-2"
                >
                    <b-form-datepicker
                        id="targetDate"
                        v-model="task.targetDateTime"
                        :min="new Date()"
                        reset-button
                    ></b-form-datepicker>
                </b-form-group>
            </div>
        </b-form>
    </b-modal>
</template>

<script>
    import { getDatabase, ref, set } from 'firebase/database'
    import { mapGetters } from 'vuex'

    export default {        
        data() {
            return {
                task: {
                    name: null,
                    priority: null,
                    sizing: null,
                    category: null,
                    targetDateTime: null,
                    deadline: null
                },

                valid: {
                    task: null,
                    priority: null,
                    sizing: null,
                    category: null
                }
            }
        },

        computed: {
            ...mapGetters(['getCategories']),

            priorities() {
                return this.$store.state.settings.priorities
            },

            sizes() {
                return this.$store.state.settings.sizes
            },

            priorityOptions() {
                let options = []
                for (let priority in this.priorities) {
                    options.push({
                        text: priority,
                        value: this.priorities[priority]
                    })
                }

                return options
            },

            sizingOptions() {
                let options = []
                for (let size in this.sizes) {
                    options.push({
                        text: size,
                        value: this.sizes[size]
                    })
                }

                return options
            },

            taskToPatch() {
                return this.$store.state.taskToPatch
            }
        },

        methods: {
            resetModal() {
                console.log('resetModal() => taskToPatch: ', this.taskToPatch)
                if (this.taskToPatch) {
                    const task = this.taskToPatch

                    this.task.name = task.name
                    this.task.priority = task.priority
                    this.task.sizing = task.sizing
                    this.task.category = task.category
                    this.task.targetDateTime = task.targetDateTime ?? null
                    this.task.id = task.id
                    this.task.deadline = task.deadline ?? null
                } else {
                    this.task.name = null
                    this.task.priority = this.priorities.critical
                    this.task.sizing = this.sizes.short
                    this.task.category = null
                    this.task.targetDateTime = null
                    this.task.id = this.createGuid()
                    this.task.deadline = null
                }
            },

            handleOk() {
                const db = getDatabase(this.$store.state.app)
                const tasksRef = ref(
                    db,
                    `tasks/${this.$store.state.user.uid}/${this.task.id}`
                )

                if (!this.taskToPatch) {
                    this.task.createdDateTime = new Date().toLocaleString()
                }
                
                set(tasksRef, this.task).then(() => {
                    console.log('added task: ', this.task)
                })
            }
        }
    }
</script>

<style scoped>
    .form-input {
        margin-bottom: 1em;
    }
</style>

<template>
    <div>
        <content-card>
            <h1>Dashboard</h1>
            <b-btn @click="logout()">Logout</b-btn>
            <b-btn @click="addTask()">Add Task</b-btn>
        </content-card>
        <task-modal />
    </div>
</template>

<script>
    import { signOut } from 'firebase/auth'
    import ContentCard from '../components/ContentCard.vue'
    import TaskModal from '../components/TaskModal.vue'

    export default {
        name: 'DashboardView',

        components: {
            ContentCard,
            TaskModal
        },

        methods: {
            logout() {
                signOut(this.$store.state.auth)
            },

            addTask() {
                this.$bvModal.show('taskModal')
            }
        }
    }
</script>

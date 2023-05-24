<template>
    <content-card>
        <h1>Dashboard</h1>
        <b-btn @click="logout()">Logout</b-btn>
    </content-card>
</template>

<script>
import { signOut } from 'firebase/auth'
import ContentCard from '../components/ContentCard.vue'

export default {
    name: 'DashboardView',

    components: {
        ContentCard
    },

    methods: {
        logout() {
            signOut(this.$store.state.auth)
        }
    }
}
</script>
<template>
    <div>
        <h1>Dashboard</h1>
        <b-btn @click="logout()">Logout</b-btn>
    </div>
</template>

<script>
import { signOut } from 'firebase/auth'

export default {
    name: 'DashboardView',

    methods: {
        logout() {
            signOut(this.$store.state.auth)
        }
    }
}
</script>
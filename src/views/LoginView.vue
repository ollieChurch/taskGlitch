<template>
    <content-card>
        <b-btn @click="register()" variant="warning" class="me-1">Register</b-btn>
        <b-btn @click="login()" variant="success" class="ms-1">Login</b-btn>
    </content-card>
</template>

<script>
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import ContentCard from '@/components/ContentCard.vue'

export default {
    name: 'LoginView',

    components: {
        ContentCard
    },

    data() {
        return {
            email: 'email4@test.com',
            password: 'password'
        }
    },

    computed: {
        auth() {
            return this.$store.state.auth
        }
    },

    methods: {
        async register() {
            try {
                const response = await createUserWithEmailAndPassword(this.auth, this.email, this.password)
                console.log(response)
            }
            catch {
                window.alert('something went wrong')
            }
        },

        async login() {
            try {
                const response = await signInWithEmailAndPassword(this.auth, this.email, this.password)
                console.log(response)
            } catch {
                window.alert('something went wrong')
            }
        }
    }
}
</script>
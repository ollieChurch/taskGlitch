<template>
    <div>
        <b-btn @click="register()" variant="warning">Register</b-btn>
        <b-btn @click="login()" variant="success">Login</b-btn>
    </div>
</template>

<script>
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

export default {
    name: 'LoginView',

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
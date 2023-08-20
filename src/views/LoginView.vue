<template>
    <content-card>
        <b-row class="align-items-center mb-4">
            <h1 class="mb-0 text-start order-2 order-sm-1 text-sm-start text-center pt-3">Say hi to Glitch...</h1>
            <b-col class="col-12 order-3 order-sm-2 col-sm-9">
                <p class="mb-0 text-sm-start">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam a tortor sed enim rutrum molestie in at metus. Proin
                    ac accumsan ipsum, ac pellentesque odio. Aliquam mattis erat
                    tellus.
                </p>
            </b-col>
            <b-col
                class="col-12 px-5 py-3 py-sm-0 px-sm-0 order-1 order-sm-3 col-sm-3"
            >
                <b-img :src="glitchImg" fluid alt="a cartoon robot"></b-img>
            </b-col>
        </b-row>
        <b-tabs pills fill>
            <b-tab title="Login">
                <b-form @submit.prevent="() => login()">
                    <b-row class="align-items-center text-start mt-4">
                        <label for="login-email" class="col-sm-3">Email</label>
                        <b-col class="col-sm-9">
                            <b-form-input
                                id="login-email"
                                v-model="email"
                                placeholder="email"
                                type="email"
                                size="lg"
                            ></b-form-input>
                        </b-col>
                    </b-row>
                    <b-row class="align-items-center text-start mt-4">
                        <label for="login-password" class="col-sm-3">
                            Password
                        </label>
                        <b-col class="col-sm-9">
                            <b-form-input
                                id="login-password"
                                v-model="password"
                                placeholder="password"
                                type="password"
                                size="lg"
                            ></b-form-input>
                        </b-col>
                    </b-row>
                    <b-btn
                        type="submit"
                        variant="success"
                        class="mt-4"
                        size="lg"
                    >
                        Login
                    </b-btn>
                </b-form>
            </b-tab>
            <b-tab title="Sign Up">
                <b-form @submit.prevent="() => register()">
                    <b-row class="align-items-center text-start mt-4">
                        <label for="register-email" class="col-sm-3"
                            >Email</label
                        >
                        <b-col class="col-sm-9">
                            <b-form-input
                                id="register-email"
                                v-model="email"
                                placeholder="email"
                                type="email"
                                size="lg"
                            ></b-form-input>
                        </b-col>
                    </b-row>
                    <b-row class="align-items-center text-start mt-4">
                        <label for="register-password" class="col-sm-3">
                            Password
                        </label>
                        <b-col class="col-sm-9">
                            <b-form-input
                                id="register-password"
                                v-model="password"
                                placeholder="password"
                                type="password"
                                size="lg"
                            ></b-form-input>
                        </b-col>
                    </b-row>
                    <b-row class="align-items-center text-start mt-4">
                        <label for="register-confirmPassword" class="col-sm-3">
                            Confirm Password
                        </label>
                        <b-col class="col-sm-9">
                            <b-form-input
                                id="register-confirmPassword"
                                v-model="confirmPassword"
                                placeholder="confirm password"
                                type="password"
                                size="lg"
                            ></b-form-input>
                        </b-col>
                    </b-row>
                    <b-btn
                        type="submit"
                        variant="warning"
                        class="mt-4"
                        size="lg"
                    >
                        Register
                    </b-btn>
                </b-form>
            </b-tab>
        </b-tabs>
    </content-card>
</template>

<script>
    import {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword
    } from 'firebase/auth'
    import ContentCard from '@/components/ContentCard.vue'
    import glitch from '@/assets/glitch.png'

    export default {
        name: 'LoginView',

        components: {
            ContentCard
        },

        data() {
            return {
                email: '',
                password: '',
                confirmPassword: '',
                glitchImg: glitch
            }
        },

        computed: {
            auth() {
                return this.$store.state.auth
            },

            passwordConfirmed() {
                return this.password
                    ? this.password === this.confirmPassword
                    : null
            },

            validEmail() {
                if (this.email) {
                    const re = /\S+@\S+\.\S+/
                    return re.test(this.email)
                } else {
                    return null
                }
            }
        },

        methods: {
            async register() {
                if (this.passwordConfirmed && this.validEmail) {
                    try {
                        const response = await createUserWithEmailAndPassword(
                            this.auth,
                            this.email,
                            this.password
                        )
                        console.log(response)
                    } catch {
                        window.alert('something went wrong')
                    }
                } else {
                    const message = this.validEmail
                        ? 'password does not match'
                        : 'enter a valid email'
                    window.alert(message)
                }
            },

            async login() {
                try {
                    const response = await signInWithEmailAndPassword(
                        this.auth,
                        this.email,
                        this.password
                    )
                    console.log(response)
                } catch {
                    window.alert('something went wrong')
                }
            }
        }
    }
</script>

<style scoped>
    img {
        max-width: 100%;
        max-height: 100%;
    }
</style>

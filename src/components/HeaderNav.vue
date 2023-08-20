<template>
    <div>
        <b-navbar toggleable="lg" class="px-3 py-3">
            <b-navbar-brand href="/" class="glitchFont">TaskGlitch</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav class="ms-auto pt-4 pt-lg-0">
                    <router-link v-if="!user" to="/login" class="px-3 pb-0 mb-0 h4 text-decoration-none">Login</router-link>
                    <template v-else>
                        <router-link to="/" class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none">Dashboard</router-link>
                        <router-link to="/tasks" class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none">Tasks</router-link>
                        <router-link to="/schedule" class="pe-lg-4 pb-0 mb-0 h4 text-decoration-none">Glitch</router-link>
                        <router-link to="/settings" class="pb-0 mb-0 h4 text-decoration-none">Settings</router-link>
                    </template>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
    export default {
        computed: {
            user() {
                return this.$store.state.user
            }
        }
    }
</script>

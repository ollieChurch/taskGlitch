<template>
  <div class="about">
    <h1 class="heading-1">This is an about page</h1>
    <b-btn @click="openModal('login')">login</b-btn>
    <b-btn @click="openModal('signup')">Register</b-btn>
  </div>
</template>

<script>
const netlifyIdentity = require('netlify-identity-widget')

export default {
    methods: {
        openModal(modalType) {
            netlifyIdentity.open(modalType)
        }
    }
}

</script>

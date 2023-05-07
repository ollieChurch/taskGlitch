<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script>
const netlifyIdentity = require('netlify-identity-widget')
import { onValue } from 'firebase/database'

export default {
    async created() {
        netlifyIdentity.init()
        const response = await fetch(
            '/.netlify/netlify/functions/setUpDatabase',
            {
                headers: {
                    Authorization: `Bearer ${
                        netlifyIdentity.currentUser().token.access_token
                    }`
                },
                body: JSON.stringify({
                    collection: 'completed'
                }),
                method: 'POST'
            }
        )

        const data = await response.json()
        console.log(data)

        onValue(data, (snapshot) => {
            console.log('snapshot', snapshot.val());
            this.$store.commit('setCities', snapshot.val())
        });
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>

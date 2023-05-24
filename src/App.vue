<template>
  <div id="app" class="d-flex flex-column justify-content-between">
    <div>
        <nav>
        <router-link to="/">Login</router-link> |
        <router-link to="/home">Dashboard</router-link> |
        <router-link to="/tasks">Tasks</router-link> |
        <router-link to="/schedule">Glitch</router-link> |
        <router-link to="/settings">Settings</router-link> |
        </nav>  
        <router-view></router-view>
    </div>
    <page-footer />
  </div>
</template>

<script>
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'
import PageFooter from './components/PageFooter.vue'

export default {
    components: {
        PageFooter
    },

    async created() {
        const app = initializeApp(this.$store.state.firebaseConfig)
        const auth = getAuth(app)
        this.$store.commit('setApp', app)
        this.$store.commit('setAuth', auth)
        
        onAuthStateChanged(auth, (user) => {
            console.log('auth state changed')
            if (user && (!this.$store.state.user || user.uid != this.$store.state.user.uid)) {
                console.log('updating user')
                this.$store.commit('setUser', user)
                this.linkToDatabase()
            } else if (!user) {
                this.$store.commit('setCompleted', [])
                this.$store.commit('setUser', null)
                console.log('user should be logged out')
            }        
        })
    },

    methods: {
        linkToDatabase() {
            const db = getDatabase(this.$store.state.app)
            const completedRef = ref(db, `completed/${this.$store.state.user.uid}`);

            onValue(completedRef, (snapshot) => {
                console.log('snapshot', snapshot.val());
                this.$store.commit('setCompleted', snapshot.val())
            })
        }
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
  background: #E7DFC6;
  min-width: 100vw;
  min-height: 100vh;
}

nav {
  padding: 30px;
  background: white;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>

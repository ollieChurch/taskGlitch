<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <b-btn @click="register()" variant="warning">Register</b-btn>
    <b-btn @click="login()" variant="success">Login</b-btn>
    <b-btn @click="logout()" variant="danger">Logout</b-btn>
    <router-view></router-view>
  </div>
</template>

<script>
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'

export default {
    data() {
        return {
            app: {},
            auth: {},
            user: '',
            email: 'email@test.com',
            password: 'password'
        }
    },

    async created() {
        const firebaseConfig = {
            apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
            authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.VUE_APP_DATABASE_URL,
            projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VUE_APP_FIREBASE_APP_ID,
            measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
        }

        this.app = initializeApp(firebaseConfig)
        this.auth = getAuth(this.app)
        onAuthStateChanged(this.auth, (user) => {
            console.log('auth state changed')
            if (user && (!this.user || user.uid != this.user.uid)) {
                console.log('updating user')
                this.user = user
                this.linkToDatabase(user.uid)
            } else if (!user) {
                this.$store.commit('setCompleted', [])
                this.user = null
                console.log('user should be logged out')
            }        
        })
    },

    methods: {
        async register() {            
            try {
                const response = await createUserWithEmailAndPassword(this.auth, this.email, this.password)
                console.log(response)
            } catch {
                this.logout()
            }
        },

        async login() {
            try {
                const response = await signInWithEmailAndPassword(this.auth, this.email, this.password)
                console.log(response)
            } catch {
                this.logout()
            }
        },

        logout() {
            signOut(this.auth)
        },

        linkToDatabase() {
            const db = getDatabase(this.app)
            const completedRef = ref(db, `completed/${this.user.uid}`);

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

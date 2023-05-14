import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        completed: [],
        tasks: [],
        user: {},
        schedule: [],
        app: {},
        auth: {},
        firebaseConfig: {
            apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
            authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.VUE_APP_DATABASE_URL,
            projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VUE_APP_FIREBASE_APP_ID,
            measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
        }
    },
    getters: {
    },
    mutations: {
        setCompleted(state, payload) {
            state.completed = payload
        },

        setApp(state, payload) {
            state.app = payload
        },

        setAuth(state, payload) {
            state.auth = payload
        },

        setUser(state, payload) {
            state.user = payload
        }
    },
    actions: {
    },
    modules: {
    }
})

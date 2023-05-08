import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        completed: [],
        tasks: [],
        user: {},
        schedule: []
    },
    getters: {
    },
    mutations: {
        setCompleted(state, payload) {
            state.completed = payload
        },
    },
    actions: {
    },
    modules: {
    }
})

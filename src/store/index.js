import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        cities: []
    },
    getters: {
    },
    mutations: {
        setCities(state, payload) {
            state.cities = payload
        },
    },
    actions: {
    },
    modules: {
    }
})

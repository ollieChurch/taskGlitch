import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { getDatabase, ref, set, remove } from 'firebase/database'


// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

Vue.mixin({
    methods: {
        createGuid() {  
            function S4() {  
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);  
            }  
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();  
        },

        pageCheck() {
            console.log('checking page: ', this.$store.state.user)
            if (!this.$store.state.user) {
                console.log('no user found')
                this.$router.push('/login')
            }
        },

        moveTask(task, list) {
            const db = getDatabase(this.$store.state.app)

            const listRef = ref(
                db,
                `${list}/${this.$store.state.user.uid}/${task.id}`
            )

            const removeFromList =
                list === 'completed' ? 'tasks' : 'completed'
            task.completedDateTime =
                list === 'completed' ? new Date().toJSON() : null

            set(listRef, task).then(() => {
                this.removeTask(task, removeFromList)
                console.log('moved task: ', task)
            })
        },

        removeTask(task, list) {
            const db = getDatabase(this.$store.state.app)
            const listRef = ref(
                db,
                `${list}/${this.$store.state.user.uid}/${task.id}`
            )

            remove(listRef).then(() => {
                console.log(`removed from ${list}: `, task)
            })
        },
    }
})

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')



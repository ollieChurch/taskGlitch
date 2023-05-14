import Vue from 'vue'
import VueRouter from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import TaskView from '../views/TaskView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import SettingsView from '../views/SettingsView.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView
    },
    {
        path: '/home',
        name: 'dashboard',
        component: DashboardView
    },
    {
        path: '/tasks',
        name: 'tasks',
        component: TaskView
    },
    {
        path: '/schedule',
        name: 'schedule',
        component: ScheduleView
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView
    }
]

const router = new VueRouter({
    mode: 'history',
    routes: routes
})

export default router

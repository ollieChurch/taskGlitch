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
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/',
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

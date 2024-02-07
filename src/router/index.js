import Vue from 'vue'
import VueRouter from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import TaskView from '../views/TaskView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import ProfileView from '../views/ProfileView.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView
	},
	{
		path: '/profile',
		name: 'profile',
		component: ProfileView
	},
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/schedule',
        name: 'schedule',
        component: ScheduleView
    },
	{
        path: '/',
        name: 'tasks',
        component: TaskView
    },
]

const router = new VueRouter({
    mode: 'history',
    routes: routes
})

export default router

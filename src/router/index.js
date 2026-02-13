import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue')
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/schedule',
        name: 'schedule',
        component: () => import('../views/ScheduleView.vue')
    },
    {
        path: '/',
        name: 'tasks',
        component: () => import('../views/TaskView.vue')
    },
    {
        path: '/user',
        name: 'user',
        component: () => import('../views/UserManagementView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router

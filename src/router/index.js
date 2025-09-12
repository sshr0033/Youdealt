import SignUp from '@/views/SignUp.vue'
import { createRouter, createWebHistory } from 'vue-router'

const LoginPage = () => import('../views/LoginPage.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    { path: '/signup', name: 'SignUp', component: SignUp }
  ],
})

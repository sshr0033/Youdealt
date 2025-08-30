import { createRouter, createWebHistory } from 'vue-router'

const LoginPage = () => import('../views/LoginPage.vue')
const SignupPage = () => import('../views/SignupPage.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/signup', name: 'SignUp', component: SignupPage },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../main'

import LoginPage from '@/views/LoginPage.vue'
import FirebaseSignUp from '@/views/FirebaseSignUp.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import HomePage from '@/views/HomePage.vue'

import RatingUser from '@/views/RatingUser.vue'
import AdminSignUp from '@/views/AdminSignUp.vue'
import NavBar from '@/views/NavBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/Adsignup', name: 'adminSignUp', component: AdminSignUp },
    { path: '/firesignup', name: 'FireSignUp', component: FirebaseSignUp },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
    { path: '/ratings', name: 'ratings', component: RatingUser },
    { path: '/admin-homepage', name: 'AdminHomePage', component: HomePage, meta: { requiresAuth: false } },
    { path: '/homePage', name: 'HomePage', component: HomePage, meta: { requiresAuth: true } },
    { path: '/navbar', name: 'Navbar', component: NavBar, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})


router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router

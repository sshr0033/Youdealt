import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'

// --- Views ---
import LoginPage from '@/views/LoginPage.vue'
import FirebaseSignUp from '@/views/FirebaseSignUp.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import HomePage from '@/views/HomePage.vue'
import RatingUser from '@/views/RatingUser.vue'
import AdminSignUp from '@/views/AdminSignUp.vue'
import NavBar from '@/views/NavBar.vue'
import MapView from '@/views/MapView.vue'
import GoalsView from '@/views/GoalsView.vue'

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
    { path: '/mapview', name: 'mapView', component: MapView, meta: { requiresAuth: true } },
    { path: '/goals', name: 'goals', component: GoalsView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

/**
 * ✅ Wait for Firebase Auth before deciding route access
 */
router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) return next()

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe() // cleanup listener
    if (user) {
      next()
    } else {
      next('/login')
    }
  })
})

export default router

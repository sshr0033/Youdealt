import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebaseConfig";
import { useAuth } from "../stores/authStore";

// --- Views ---
import LoginPage from "@/views/LoginPage.vue";
import FirebaseSignUp from "@/views/FirebaseSignUp.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import HomePage from "@/views/HomePage.vue";
import RatingUser from "@/views/RatingUser.vue";
import AdminSignUp from "@/views/AdminSignUp.vue";
import MapView from "@/views/MapView.vue";
import GoalsView from "@/views/GoalsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [

    {
      path: "/",
      name: "Root",
      redirect: "/login",
    },


    { path: "/login", name: "Login", component: LoginPage },
    { path: "/firesignup", name: "FireSignUp", component: FirebaseSignUp },
    { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
    { path: "/Adsignup", name: "AdminSignUp", component: AdminSignUp },

    {
      path: "/homepage",
      name: "HomePage",
      component: HomePage,
      meta: { requiresAuth: true },
    },
    {
      path: "/mapview",
      name: "MapView",
      component: MapView,
      meta: { requiresAuth: true },
    },
    {
      path: "/goals",
      name: "GoalsView",
      component: GoalsView,
      meta: { requiresAuth: true },
    },


    { path: "/ratings", name: "RatingUser", component: RatingUser },
    {
      path: "/admin-homepage",
      name: "AdminHomePage",
      component: HomePage,
      meta: { requiresAuth: false },
    },


    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});


router.beforeEach(async (to, from, next) => {
  const { user } = useAuth();


  if (!to.meta.requiresAuth) {
    if (to.path === "/login" && user.value) {

      return next("/homepage");
    }
    return next();
  }


  const currentUser = auth.currentUser || user.value;

  if (currentUser) {
    return next();
  }


  const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    unsubscribe();
    if (firebaseUser) {
      user.value = firebaseUser;
      next();
    } else {
      next("/login");
    }
  });
});

export default router;

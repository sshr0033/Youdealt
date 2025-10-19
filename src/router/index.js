import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebaseConfig";
import { useAuth } from "../stores/authStore";


import LoginPage from "@/views/LoginPage.vue";
import FirebaseSignUp from "@/views/FirebaseSignUp.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import HomePage from "@/views/HomePage.vue";
import RatingUser from "@/views/RatingUser.vue";
import AdminSignUp from "@/views/AdminSignUp.vue";
import MapView from "@/views/MapView.vue";
import GoalsView from "@/views/GoalsView.vue";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import DashboardView from "@/views/DashboardView.vue";

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
  path: '/admindashboard',
  name: 'AdminDashboard',
  component: () => import('../views/DashboardView.vue'),
  meta: { requiresAuth: true, role: 'admin' }
},


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
      component: DashboardView,
      meta: { requiresAuth: false },
    },


    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ],
});


async function getAdminDoc(uid) {
  try {
    const adminSnap = await getDoc(doc(db, "admins", uid));
    return adminSnap.exists() ? adminSnap.data() : null;
  } catch (err) {
    console.error("Error checking admin role:", err);
    return null;
  }
}


router.beforeEach(async (to) => {
  const { user } = useAuth();
  const currentUser = auth.currentUser || user.value;

  // 1️⃣ Public routes (no auth needed)
  if (!to.meta.requiresAuth) {
    // Redirect logged-in users away from login/signup
    if (to.path === "/login" && currentUser) {
      // Check if the user is an admin
      const adminDoc = currentUser ? await getAdminDoc(currentUser.uid) : null;
      return adminDoc ? "/admindashboard" : "/homepage";
    }
    return true; // allow navigation
  }

  // 2️⃣ Protected routes
  if (currentUser) {

    if (to.meta.role === "admin") {
      const adminDoc = await getAdminDoc(currentUser.uid);
      if (!adminDoc) {
        alert("Access denied: Admins only.");
        return "/homepage";
      }
    }
    return true;
  }

  const firebaseUser = await new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((u) => {
      unsub();
      resolve(u);
    });
  });

  if (firebaseUser) {
    user.value = firebaseUser;
    // redirect admin after login
    const adminDoc = await getAdminDoc(firebaseUser.uid);
    return adminDoc ? "/admindashboard" : true;
  } else {
    return "/login";
  }
});


export default router;

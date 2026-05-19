import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import RatingUser from "@/views/RatingUser.vue";
import MapView from "@/views/MapView.vue";
import GoalsView from "@/views/GoalsView.vue";
import DashboardView from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Root",
      redirect: "/homepage",
    },
    {
      path: "/homepage",
      name: "HomePage",
      component: HomePage,
    },
    {
      path: "/mapview",
      name: "MapView",
      component: MapView,
    },
    {
      path: "/goals",
      name: "GoalsView",
      component: GoalsView,
    },
    {
      path: "/ratings",
      name: "RatingUser",
      component: RatingUser,
    },
    {
      path: "/admindashboard",
      name: "AdminDashboard",
      component: DashboardView,
    },
    {
      path: "/admin-homepage",
      name: "AdminHomePage",
      component: DashboardView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/homepage",
    },
  ],
});

export default router;

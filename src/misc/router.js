import { createRouter, createWebHistory } from "vue-router";
import BaseView from "@/views/Main/BaseView.vue";
import CertificatesView from "@/views/Main/CertificatesView.vue";
import CoursesView from "@/views/Main/CoursesView.vue";
import ManagerView from "@/views/Main/ManagerView.vue";
import StatisticsView from "@/views/Main/StatisticsView.vue";
import StudyCenter from "@/views/Main/StudyCenterView.vue";
import SignUpView from "@/views/Auth/SignUpView.vue";
import LoginView from "@/views/Auth/LoginView.vue";
import NotFoundView from "@/views/Misc/NotFoundView.vue";
import CertificatesSetView from "@/views/Main/CertificatesSetView.vue";
import { useAuthStore } from "./store";
import CertificateView from "@/views/Main/CertificateView.vue";

export const routes = [
  {
    path: "/",
    name: "root",
    redirect: (to) => {
      const authStore = useAuthStore();

      return authStore.user?.roles.includes("admin")
        ? { name: "study-center" }
        : { name: "certificate-sets" };
    },
  },
  {
    path: "/base",
    name: "base",
    component: BaseView,
    meta: { label: "Baza", access: ["admin"] },
  },
  {
    path: "/certificates",
    name: "certificate-sets",
    component: CertificatesSetView,
    meta: { label: "Sertifikatlar To'plami", access: ["admin", "manager"] },
  },
  {
    path: "/certificate/:certificate_uuid",
    name: "certificate",
    component: CertificateView,
    meta: { layout: "empty", requiresAuth: false },
  },
  {
    path: "/certificates/:study_center_id",
    name: "certificates",
    component: CertificatesView,
    meta: { label: "Sertifikatlar", access: ["admin", "manager"] },
  },
  {
    path: "/courses",
    name: "courses",
    component: CoursesView,
    meta: { label: "Kurslar", access: ["admin"] },
  },
  {
    path: "/manager",
    name: "manager",
    component: ManagerView,
    meta: { label: "Managerlar", access: ["admin"] },
  },
  {
    path: "/statistics",
    name: "statistics",
    component: StatisticsView,
    meta: { label: "Statistikalar", access: ["admin", "manager"] },
  },
  {
    path: "/study-center",
    name: "study-center",
    component: StudyCenter,
    meta: { label: "O'quv Markazlar", access: ["admin"] },
  },
  {
    path: "/signup",
    name: "signup",
    component: SignUpView,
    meta: { layout: "empty", requiresAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { layout: "empty", requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/404",
    name: "not-found",
    component: NotFoundView,
    meta: { layout: "empty" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, f, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const user = JSON.parse(localStorage.getItem("user"));
  const requiresAuth = to.meta.requiresAuth !== false;
  const allowedRoles = to.meta.access || [];
  const accessToken = localStorage.getItem("access_token");

  if (!requiresAuth) return next();
  if (!accessToken) return next({ name: "login" });
  if (isAuthenticated) {
    if (!user) return next({ name: "login" });

    const hasAccess =
      !allowedRoles.length ||
      allowedRoles.some((role) => user.roles.includes(role));
    if (!hasAccess) return next({ name: "not-found" });
  }

  next();
});

export default router;

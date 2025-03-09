import { defineStore } from "pinia";
import api from "./api";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    async fetchUser() {
      const router = useRouter();

      try {
        const response = await api.get("/users/me/");
        this.user = response.data;
        this.isAuthenticated = true;
        this.user.roles = [];

        if (response.data.is_staff) this.user.roles.push("admin");
        if (response.data.is_manager) this.user.roles.push("manager");

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("isAuthenticated", this.isAuthenticated);
      } catch (error) {
        this.user = null;
        this.isAuthenticated = false;
        router.push({ name: "login" });
      }
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    },
  },
});

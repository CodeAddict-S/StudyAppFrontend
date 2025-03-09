import axios from "axios";
import router from "@/misc/router";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (config.headers["Authorization"] === "") return config;

    const access_token = localStorage.getItem("access_token") || null;
    if (access_token) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      (error.response.status === 401 ||
        error.response.data?.code === "token_not_valid") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refresh_token = localStorage.getItem("refresh_token");

      if (refresh_token) {
        try {
          const response = await api.post("/token/refresh/", {
            refresh: refresh_token,
          });
          if (response.status === 200) {
            const newAccessToken = response.data.access;
            localStorage.setItem("access_token", newAccessToken);
            api.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] =
              `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return api(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          router.push({ name: "login" });
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        router.push({ name: "login" });
      }
    }

    return Promise.reject(error);
  },
);

export default api;

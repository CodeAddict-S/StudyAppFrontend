import "./index.css";
import "@flaticon/flaticon-uicons/css/all/all.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./misc/router";
import component from "./misc/component";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(component);

router.isReady().then(() => app.mount("#app"));

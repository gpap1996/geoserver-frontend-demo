import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import vuetify from "@/plugins/vuetify";
import OpenLayersMap from "vue3-openlayers";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(OpenLayersMap /*, options */);

app.mount("#app");

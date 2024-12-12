import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
// plugins
import { Toast, options } from "@/plugins/toast";
import vuetify from "@/plugins/vuetify";

const app = createApp(App);
app.use(Toast, options);
app.use(vuetify);
app.mount("#app");

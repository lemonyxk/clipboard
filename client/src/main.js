import { createApp } from "vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import App from "./App.vue";
import { loadFonts } from "./plugins/webfontloader";

loadFonts();

createApp(App).use(router).use(vuetify).mount("#app");

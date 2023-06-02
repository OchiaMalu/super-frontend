import {createApp} from 'vue'

import App from './App.vue'
import {Button, ConfigProvider, Icon, NavBar} from 'vant';
import 'vant/lib/index.css';
import * as VueRouter from 'vue-router'
import routes from "./config/routes.ts";
import "./global.css"
import BasicLayout from "./layouts/BasicLayout.vue";
import BlogEditPage from "./pages/BlogEditPage.vue";
import "../public/icon/iconfont.css"

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
})
const app = createApp(App);
app.component("default-layout", BasicLayout)
app.component("blog-layout", BlogEditPage)
app.use(Button);
app.use(NavBar);
app.use(Icon);
app.use(router)
app.use(ConfigProvider);
app.mount('#app')

import {createApp} from 'vue'

import App from './App.vue'
import {Button, Icon, NavBar} from 'vant';
import 'vant/lib/index.css';
import * as VueRouter from 'vue-router'
import routes from "./config/routes.ts";
import "./global.css"

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
})
const app = createApp(App);
app.use(Button);
app.use(NavBar);
app.use(Icon);
app.use(router)
app.mount('#app')

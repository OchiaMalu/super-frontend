import {createApp} from 'vue'
// import './style.css'
import App from './App.vue'
import {Button, Icon, NavBar} from 'vant';
import 'vant/lib/index.css';
import * as VueRouter from 'vue-router'
import routes from "./config/routes.ts";

const router = VueRouter.createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})
const app = createApp(App);
app.use(Button);
app.use(NavBar);
app.use(Icon);
app.use(router)
app.mount('#app')

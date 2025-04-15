import Login from "../components/Login/Login.vue";
import Home from "../components/Home.vue";
import User from "../components/UserManage/User.vue";
import DashBoard from "../components/DashBoard/DashBoard.vue";
import Config from "../components/Config/Config.vue";
import Tag from "../components/Tag/Tag.vue";

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    {
        path: "/home",
        component: Home,
        children: [
            { path: "/dashboard", component: DashBoard },
            { path: "/user", component: User },
            { path: "/config", component: Config },
            { path: "/tag", component: Tag },
        ],
    },
];
export default routes;

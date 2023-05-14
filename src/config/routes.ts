import Index from "../pages/Index.vue";
import Team from "../pages/TeamPage.vue";
import User from "../pages/UserPage.vue";
import Search from "../pages/SearchPage.vue";
import EditUser from "../pages/UserEditPage.vue";
import SearchResult from "../pages/SearchResultPage.vue";
import UserLogin from "../pages/UserLoginPage.vue";

const routes = [
    { path: '/', component: Index },
    { path: '/team', component: Team },
    { path: '/user',component: User},
    { path: '/search',component: Search},
    { path: '/user/edit',component: EditUser},
    { path: '/search/userList',component: SearchResult },
    { path: '/user/login',component: UserLogin }
]
export default routes;
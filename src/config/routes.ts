import Index from "../pages/Index.vue";
import Team from "../pages/TeamPage.vue";
import User from "../pages/UserPage.vue";
import Search from "../pages/SearchPage.vue";
import EditUser from "../pages/UserEditPage.vue";
import SearchResult from "../pages/SearchResultPage.vue";
import UserLogin from "../pages/UserLoginPage.vue";
import TeamAddPage from "../pages/TeamAddPage.vue";
import TeamUpdatePage from "../pages/TeamUpdatePage.vue";
import UserUpdatePage from "../pages/UserUpdatePage.vue";
import UserTeamJoinPage from "../pages/UserTeamJoinPage.vue";
import UserTeamCreatePage from "../pages/UserTeamCreatePage.vue";

const routes = [
    {path: '/', component: Index},
    {path: '/search', component: Search},
    {path: '/search/userList', component: SearchResult},
    {path: '/team', component: Team},
    {path: '/team/add', component: TeamAddPage},
    {path: '/team/update', component: TeamUpdatePage},
    {path: '/user', component: User},
    {path: '/user/login', component: UserLogin},
    {path: '/user/edit', component: EditUser},
    {path: '/user/update', component: UserUpdatePage},
    {path: '/user/team/join', component: UserTeamJoinPage},
    {path: '/user/team/create', component: UserTeamCreatePage}
]
export default routes;
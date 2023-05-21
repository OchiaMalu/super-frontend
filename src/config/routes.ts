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
    {path: '/', title: "速配SUPER", component: Index},
    {path: '/search', title: "搜索", component: Search},
    {path: '/search/userList', title: "搜索到的用户", component: SearchResult},
    {path: '/team', title: "队伍", component: Team},
    {path: '/team/add', title: "创建队伍", component: TeamAddPage},
    {path: '/team/update', title: "更新队伍", component: TeamUpdatePage},
    {path: '/user', title: "个人", component: User},
    {path: '/user/login', title: "用户登录", component: UserLogin},
    {path: '/user/edit', title: "修改用户", component: EditUser},
    {path: '/user/update', title: "修改用户", component: UserUpdatePage},
    {path: '/user/team/join', title: "我加入的队伍", component: UserTeamJoinPage},
    {path: '/user/team/create', title: "我创建的队伍", component: UserTeamCreatePage}
]
export default routes;
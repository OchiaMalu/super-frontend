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
import SignUpPage from "../pages/SignUpPage.vue";
import BlogEditPage from "../pages/BlogEditPage.vue";
import MessagePage from "../pages/MassagePage.vue";
import UserBlogPage from "../pages/UserBlogPage.vue";

const routes = [
    {path: '/', title: "速配SUPER", component: Index},
    {path: '/search', title: "搜索", component: Search},
    {path: '/search/userList', title: "搜索到的用户", component: SearchResult},
    {path: '/team', title: "队伍", component: Team},
    {path: '/team/add', title: "创建队伍", component: TeamAddPage},
    {path: '/team/update', title: "更新队伍", component: TeamUpdatePage},
    {path: '/user', title: "个人", component: User},
    {path: '/user/signup', component: SignUpPage},
    {path: '/user/login', title: "用户登录", component: UserLogin},
    {path: '/user/edit', title: "修改用户", component: EditUser},
    {path: '/user/update', title: "修改用户", component: UserUpdatePage},
    {path: '/user/team/join', title: "我加入的队伍", component: UserTeamJoinPage},
    {path: '/user/team/create', title: "我创建的队伍", component: UserTeamCreatePage},
    {path: '/blog/edit', title: '博文编辑', component: BlogEditPage, meta: {layout: 'blog'}},
    {path: '/user/blog', title: '我写的博文', component: UserBlogPage},
    {path: '/message', title: '消息中心', component: MessagePage}
]
export default routes;
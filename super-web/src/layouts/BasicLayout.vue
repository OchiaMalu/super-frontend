<template>
    <van-sticky>
        <van-nav-bar
            :title="title"
            left-arrow
            @click-left="onClickLeft"
            @click-right="onClickRight"
        >
            <template #right>
                <van-icon name="search" size="18" />
            </template>
        </van-nav-bar>
    </van-sticky>
    <div class="content">
        <router-view />
    </div>
    <van-tabbar route v-model="active">
        <van-tabbar-item to="/" icon="home-o" name="index">主页</van-tabbar-item>
        <van-tabbar-item to="/team" icon="flag-o" name="team">队伍</van-tabbar-item>
        <van-tabbar-item replace class="van-tabbar-addBlog" @click="checkLogin('/blog/edit',2)">
            <div class="center-wrap">
                <div class="bgc-wrap">
                    <van-icon name="plus" size="27" class="icon" />
                </div>
            </div>
        </van-tabbar-item>
        <van-tabbar-item v-if="hasMessage" icon="smile-comment-o" name="message" class="message"
                         @click="checkLogin('/message',3)" dot>
            消息
        </van-tabbar-item>
        <van-tabbar-item v-else icon="smile-comment-o" name="message" class="message" @click="checkLogin('/message',3)">
            消息
        </van-tabbar-item>
        <van-tabbar-item to="/user" icon="user-o" name="user">个人</van-tabbar-item>
    </van-tabbar>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog } from "vant";
import routes from "../config/routes";
import { getCurrentUser } from "../services/user";
import myAxios from "../plugins/my-axios";

interface Route {
    path: string;
    title?: string;
}

interface MessageElement extends HTMLElement {
    style: CSSStyleDeclaration;
}

// 响应式状态定义
const hasMessage = ref<boolean>(false);
const router = useRouter();
const DEFAULT_TITLE = "速配SUPER";
const title = ref<string>(DEFAULT_TITLE);
const active = ref<string>("index");

// 路由导航守卫
router.beforeEach(async (to) => {
    try {
        const toPath = to.path;
        const route = routes.find((route: Route) => route.path === toPath);

        document.title = "速配SUPER";
        title.value = route?.title ?? DEFAULT_TITLE;

        if (to.path !== "/user/login") {
            const res = await myAxios.get("/message");
            if (res?.data.code === 0) {
                hasMessage.value = !!res.data.data;
            }
        }
    } catch (error) {
        console.error("Navigation error:", error);
    }
});

// 导航处理
const onClickLeft = (): void => {
    router.back();
};

const onClickRight = (): void => {
    router.push("/search");
};

// 登录检查
const checkLogin = async (to: string, index: number): Promise<void> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            await showConfirmDialog({
                message: "该功能需要登陆后使用,是否登录",
                confirmButtonText: "去登录",
            });
            router.replace("/user/login");
        } else {
            await router.push(to);
            if (active.value === "message") {
                const messageElement = document.getElementsByClassName("message")[0] as MessageElement;
                if (messageElement) {
                    messageElement.style.color = "#1989fa";
                }
            }
        }
    } catch {
        // 用户取消登录对话框
    }
};
</script>

<style scoped>
.content {
    padding-bottom: 70px;
}

.van-tabbar-addBlog {
    flex: 0 0 96px !important; /* 设置固定宽度，不参与flex布局的伸缩 */
}

.center-wrap {
    width: 80px;
    height: 80px;
    margin-top: -20px;
    z-index: 100000;
    background-color: white;
    border-radius: 50% 50% 0 0;
    position: relative;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
    left: 50%;
    transform: translateX(-50%);
}

.bgc-wrap {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3c89fc;
    position: absolute;
    left: 15px;
    top: 10px;
}

.icon {
    margin-left: -3px;
    margin-top: -3px;
    color: white;
}

.message {
    margin: 0;
}

[class*=van-hairline]::after {
    border: none !important;
}
</style>

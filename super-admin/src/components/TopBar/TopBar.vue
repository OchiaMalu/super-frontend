<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import myAxios from "../../plugins/my-axios.ts";
import type { UserResponse, MenuItem } from "../../types";

// 菜单配置
const menuItems: MenuItem[] = [
    { path: "dashboard", title: "首页" },
    { path: "config", title: "配置" },
    { path: "user", title: "用户管理" },
    { path: "tag", title: "标签管理" },
];

// 状态定义
const activeP = ref<string>("");
const avatarUrl = ref<string>("");
const router = useRouter();

// 获取用户信息
const fetchUserInfo = async (): Promise<void> => {
    try {
        const res = await myAxios.get<UserResponse>("/user/admin/current");
        if (res.data.code !== 0) {
            ElMessage.error(res.data.description || "获取用户信息失败");
            sessionStorage.clear();
            return;
        }
        avatarUrl.value = res.data.data.avatarUrl;
    } catch (error) {
        ElMessage.error("网络请求失败");
        sessionStorage.clear();
    }
};

// 保存导航状态
const saveNavState = (activePath: string): void => {
    window.sessionStorage.setItem("activePath", activePath);
    activeP.value = activePath;
};

// 初始化导航状态
const initNavState = (): void => {
    const savedPath = sessionStorage.getItem("activePath");
    activeP.value = savedPath || "";
};

// 退出登录
const logout = (): void => {
    ElMessageBox.confirm(
        "确认退出",
        {
            confirmButtonText: "OK",
            cancelButtonText: "取消",
            type: "warning",
        },
    ).then(() => {
        sessionStorage.clear();
        router.push("/login");
        ElMessage({
            type: "success",
            message: "退出成功",
        });
    }).catch(() => {
        // 用户取消退出，不做任何操作
    });
};

// 生命周期钩子
onMounted(async () => {
    initNavState();
    await fetchUserInfo();
});
</script>

<template>
    <el-menu
        :default-active="activeP"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        router
    >
        <el-menu-item index="0">
            <img
                style="width: 40px"
                src="/favicon.ico"
                alt="Element logo"
            />
            <h3>速配管理系统</h3>
        </el-menu-item>

        <div class="flex-grow" />

        <!-- 动态渲染菜单项 -->
        <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
            @click="saveNavState(item.path)"
        >
            {{ item.title }}
        </el-menu-item>

        <el-sub-menu>
            <template #title>
                <el-avatar :src="avatarUrl" />
            </template>
            <el-menu-item @click="logout">退出系统</el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<style scoped>
.flex-grow {
    flex-grow: 1;
}

.el-menu {
    border-bottom: none;
}

.el-menu-item {
    display: flex;
    align-items: center;
}

.el-avatar {
    margin-left: 8px;
}
</style>

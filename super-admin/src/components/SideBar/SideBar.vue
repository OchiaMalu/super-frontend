<template>
    <el-menu
        :default-active="activeP"
        style="height: 100%"
        router
    >
        <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
            @click="saveNavState(item.path)"
        >
            <el-icon>
                <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
        </el-menu-item>
    </el-menu>
</template>

<script lang="ts" setup>
import { Location, User } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import type { MenuItem } from "../../types";

// 菜单配置
const menuItems: MenuItem[] = [
    {
        path: "dashboard",
        icon: Location,
        title: "工作台",
    },
    {
        path: "user",
        icon: User,
        title: "用户管理",
    },
];

// 当前激活的路径
const activeP = ref<string>("");

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

onMounted(() => {
    initNavState();
});
</script>

<style scoped>
.el-menu {
    border-right: none;
}

.el-menu-item {
    display: flex;
    align-items: center;
    padding: 0 20px;
}

.el-icon {
    margin-right: 8px;
}
</style>

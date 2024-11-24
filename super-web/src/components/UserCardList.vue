<template>
    <van-card v-for="user in props.userList"
              :title="user.username"
              :desc="user.profile"
    >
        <template #thumb>
            <van-image :src="user.avatarUrl" width="88" height="88" @click="showUserDetail(user.id)" />
        </template>
        <template #tags>
            <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px;margin-top: 8px"
                     @click="showUserDetail(user.id)">
                {{ tag }}
            </van-tag>
        </template>
        <template #num>
            <van-button size="mini" plain type="primary"
                        style="width: 48px;height: 28px;margin-top: 10px" @click="toChat(user)">
                私聊
            </van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import type { UserType } from "../models/user";

interface Props {
    userList: UserType[];
}

// Props 定义
const props = defineProps<Props>();
const router = useRouter();

// 用户详情导航
const showUserDetail = (id: number): void => {
    router.push({
        path: "/user/detail",
        query: { id },
    });
};

// 聊天导航
const toChat = (user: UserType): void => {
    router.push({
        path: "/chat",
        query: {
            id: user.id,
            username: user.username,
            userType: 1,
        },
    });
};
</script>

<style scoped>

</style>

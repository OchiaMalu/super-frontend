<template>
    <van-card v-for="user in userList"
              :key="user.id"
              :title="user.username"
              :desc="user.profile"
    >
        <template #thumb>
            <van-image round width="88" height="88" style="margin-right: 10px" :src="user.avatarUrl"
                       @click="showUserDetail(user.id)" />
        </template>
        <template #tags>
            <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px;margin-top: 8px"
                     @click="showUserDetail(user.id)">
                {{ tag }}
            </van-tag>
        </template>
        <template #num>
            <van-button v-if="loginUser.id===team.userId || loginUser.role===1" size="mini" plain type="danger"
                        style="width: 48px;height: 28px;margin-top: 10px" @click="kickOut(user.id)">
                踢出
            </van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import myAxios from "../plugins/my-axios";
import type { UserType } from "../models/user";
import type { TeamType } from "../models/team";

interface Props {
    userList: UserType[];
    loginUser: UserType;
    team: TeamType;
}

// Props 和 Emits 定义
const props = defineProps<Props>();
const emits = defineEmits(["refresh"]);

const router = useRouter();

// 用户详情导航
const showUserDetail = (id: number): void => {
    router.push({
        path: "/user/detail",
        query: { id },
    });
};

// 踢出用户
const kickOut = async (userId: number): Promise<void> => {
    try {
        const res = await myAxios.post("/team/kick", {
            teamId: props.team.id,
            userId,
        });

        if (res?.data.code === 0) {
            emits("refresh");
        }
    } catch (error) {
        console.error("Failed to kick out user:", error);
    }
};
</script>

<style scoped>

</style>

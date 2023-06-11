<template>
    <van-card v-for="user in userList"
              :desc="user.profile"
              :title="user.username"
              :thumb="user.avatarUrl"
    >
        <template #tags>
            <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px;margin-top: 8px">
                {{ tag }}
            </van-tag>
        </template>
        <template #num>
            <van-button v-if="user.isFollow" size="mini" plain type="primary" style="width: 48px;height: 28px"
                        color="#c1c1c1" @click="followUser(user)">
                已关注
            </van-button>
            <van-button v-else size="mini" plain type="primary" style="width: 48px;height: 28px"
                        @click="followUser(user)">
                关注
            </van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import {UserType} from "../models/user.js";
import myAxios from "../plugins/my-axios.js";

interface UserCardListProps {
    userList: UserType[]
}

const props = defineProps<UserCardListProps>()

const followUser = async (user) => {
    let res = await myAxios.post("/follow/" + user.id);
    if (res?.data.code === 0) {
        let res_ = await myAxios.get("/user/" + user.id);
        if (res_.data.code === 0) {
            user.isFollow = res_.data.data.isFollow
        }
    }
}
</script>

<style scoped>

</style>

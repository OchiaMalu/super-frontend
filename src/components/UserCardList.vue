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
        <template #footer>
            <van-button size="mini">联系我</van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import {UserType} from "../models/user.js";

interface UserCardListProps {
    userList: UserType[]
}

const props = defineProps<UserCardListProps>()
</script>

<style scoped>

</style>
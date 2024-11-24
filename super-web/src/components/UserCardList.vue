<template>
    <van-card v-for="user in userList"
              :title="user.username"
              :desc="user.profile"
    >
        <template #thumb>
            <van-image :src="user.avatarUrl" width="88" height="88" @click="showUserDetail(user.id)"/>
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
            <!--            <van-button v-if="user?.isFollow" size="mini" plain type="primary"-->
            <!--                        style="width: 48px;height: 28px;margin-top: 10px"-->
            <!--                        color="#c1c1c1" @click="followUser(user)">-->
            <!--                已关注-->
            <!--            </van-button>-->
            <!--            <van-button v-else size="mini" plain type="primary" style="width: 48px;height: 28px;margin-top: 10px"-->
            <!--                        @click="followUser(user)">-->
            <!--                关注-->
            <!--            </van-button>-->
        </template>
    </van-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import myAxios from "../plugins/my-axios";
import type { UserType } from "../models/user";

interface Props {
  userList: UserType[];
}

// Props 定义
const props = defineProps<Props>();
const router = useRouter();

// 关注用户
const followUser = async (user: UserType): Promise<void> => {
  try {
    const res = await myAxios.post(`/follow/${user.id}`);
    if (res?.data.code === 0) {
      const res_ = await myAxios.get(`/user/${user.id}`);
      if (res_.data.code === 0) {
        user.isFollow = res_.data.data.isFollow;
      }
    }
  } catch (error) {
    console.error('Failed to follow user:', error);
  }
};

// 用户详情导航
const showUserDetail = (id: number): void => {
  router.push({
    path: "/user/detail",
    query: { id }
  });
};

// 聊天导航
const toChat = (user: UserType): void => {
  router.push({
    path: "/chat",
    query: {
      id: user.id,
      username: user.username,
      userType: 1
    }
  });
};
</script>

<style scoped>

</style>

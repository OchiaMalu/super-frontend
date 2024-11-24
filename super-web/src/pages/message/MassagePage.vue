<template>
    <van-grid :border="false">
        <van-grid-item icon="comment" icon-color="#767ffe" text="所有评论" to="/user/comment" />
        <van-grid-item v-if="likeNum===0" icon="good-job" icon-color="#639efc" text="赞" to="/user/like" />
        <van-grid-item v-else icon="good-job" icon-color="#639efc" text="赞" :badge="likeNum" to="/user/like" />
        <van-grid-item icon="friends" icon-color="#a778fc" text="关注" to="/user/follow" />
        <van-grid-item to="/fans">
            <template #icon>
                <van-icon class-prefix="my-icon" name="wodefensi" color="#65cdf2" size="28" />
            </template>
            <template #text>
                <span style="margin-top: 8px;font-size: 14px">粉丝</span>
            </template>
        </van-grid-item>
    </van-grid>
    <van-divider />
    <van-cell to="/ai">
        <template #title>
            <span class="cell-span">AI助手</span>
        </template>
        <template #icon>
            <div class="icon_area">
                <van-icon color="#2a2e31" class-prefix="my-icon" name="wuguan" size="25"
                          style="margin-left: 12px;margin-top: 13px"/>
            </div>
        </template>
    </van-cell>
    <van-cell to="/user/follow/blog">
        <template #title>
            <span class="cell-span">我的关注</span>
        </template>
        <template #icon>
            <van-badge v-if="blogNum>0" :content="blogNum" max="99">
                <div class="icon_area">
                    <van-icon color="#2a2e31" class-prefix="my-icon" name="guanzhu" size="25"
                              style="margin-left: 12px;margin-top: 13px" />
                </div>
            </van-badge>
            <van-badge v-else>
                <div class="icon_area">
                    <van-icon color="#2a2e31" class-prefix="my-icon" name="guanzhu" size="25"
                              style="margin-left: 12px;margin-top: 13px" />
                </div>
            </van-badge>
        </template>
    </van-cell>
    <van-cell to="/private">
        <template #title>
            <span class="cell-span">私聊</span>
        </template>
        <template #icon>
            <van-badge v-if="unReadPrivateNum>0" :content="unReadPrivateNum" max="99">
                <div class="icon_area">
                    <van-icon name="envelop-o" size="25"
                              style="margin-left: 12px;margin-top: 13px" />
                </div>
            </van-badge>
            <van-badge v-else>
                <div class="icon_area">
                    <van-icon name="envelop-o" size="25"
                              style="margin-left: 12px;margin-top: 13px" />
                </div>
            </van-badge>
        </template>
    </van-cell>
    <van-cell @click="toHallChat">
        <template #title>
            <span class="cell-span">公共聊天室</span>
        </template>
        <template #label>
            <span class="cell-span">SUPER速配官方聊天室</span>
        </template>
        <template #icon>
            <div class="icon_area">
                <van-image src="../../public/favicon.ico" width="25" height="25" round
                           style="margin-left: 12px;margin-top: 12px" />
            </div>
        </template>
        <template #value>
            <van-tag color="#ffe1e1" text-color="#ad0000">官方</van-tag>
        </template>
    </van-cell>
    <van-cell-group v-for="team in teamList">
        <van-cell @click="toChatRoom(team.id,team.name)">
            <template #title>
                <span class="cell-span">{{ `${team.name}` + "聊天室" }}</span>
            </template>
            <template #label>
                <span class="cell-span">{{ team.description }}</span>
            </template>
            <template #icon>
                <van-image :src="team.coverImage || defaultImg" round width="50" height="50"
                           style="margin-left: 10px" />
                <!--                    <van-icon name="volume" color="#2a2e31" class="icon" size="20px"/>-->
            </template>
        </van-cell>
    </van-cell-group>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import myAxios from "../../plugins/my-axios";
import defaultImg from "../../../public/defalutTeamImg.jpg";

interface Team {
  id: number;
  name: string;
  description: string;
  coverImage?: string;
}

// 响应式状态定义
const teamList = ref<Team[]>([]);
const likeNum = ref<number>(0);
const blogNum = ref<number>(0);
const unReadPrivateNum = ref<number>(0);

const router = useRouter();

// 方法定义
const toChatRoom = (id: number, name: string): void => {
  router.push({
    path: "/chat",
    query: {
      teamId: id,
      teamName: name,
      teamType: 2,
    },
  });
};

const toHallChat = (): void => {
  router.push("/chat");
};

// 生命周期钩子
onMounted(async () => {
  try {
    // 获取团队列表
    const teamRes = await myAxios.get("/team/list/my/join/all");
    if (teamRes?.data.code === 0) {
      teamList.value = teamRes.data.data;
    }

    // 获取点赞数
    const likeRes = await myAxios.get("/message/like/num");
    if (likeRes?.data.code === 0) {
      likeNum.value = Number(likeRes.data.data);
    }

    // 获取博客数
    const blogRes = await myAxios.get("/message/blog/num");
    if (blogRes?.data.code === 0) {
      blogNum.value = Number(blogRes.data.data);
    }

    // 获取未读私信数
    const privateRes = await myAxios.get("/chat/private/num");
    if (privateRes?.data.code === 0) {
      unReadPrivateNum.value = privateRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
});
</script>

<style>
.icon_area {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ededed;
    position: relative;
    margin-left: 10px;
}

.van-cell {
    padding-left: 5px;
}

.icon {
    position: absolute;
    left: 14px;
    top: 14px
}

.van-divider {
    margin: 2px;
}

.cell-span {
    margin-left: 10px;
}

:root:root {
    --van-grid-item-text-font-size: 14px
}
</style>

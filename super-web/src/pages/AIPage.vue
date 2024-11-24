<template>
    <van-sticky>
        <van-nav-bar
            title="AI 助手"
            left-arrow
            @click-left="onClickLeft"
        >
        </van-nav-bar>
    </van-sticky>
    <div class="chat-container">
        <div class="content" ref="chatRoom" v-html="stats.content"></div>
        <van-cell-group inset style="position: fixed;bottom: 0;width: 100%">
            <van-field
                v-model="stats.text"
                center
                clearable
                placeholder="聊点什么吧...."
            >
                <template #button>
                    <van-button size="small" type="primary" @click="send" style="margin-right: 16px">发送</van-button>
                </template>
            </van-field>
        </van-cell-group>
    </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showFailToast } from "vant";
import { getCurrentUser } from "../services/user";
import myAxios from "../plugins/my-axios";

interface User {
  id: number;
  username: string;
  avatarUrl: string;
}

interface AIUser {
  username: string;
  avatarUrl: string;
}

interface ChatStats {
  user: User;
  ai: AIUser;
  text: string;
  content: string;
}

const defaultMessage = "你好,我是速配SUPER的智能助手,欢迎问我任何问题。";
const route = useRoute();
const router = useRouter();
const chatRoom = ref<HTMLElement | null>(null);

const stats = ref<ChatStats>({
  user: {
    id: 0,
    username: "",
    avatarUrl: "",
  },
  ai: {
    username: "AI",
    avatarUrl: "https://img.zcool.cn/community/0179e358a53d9aa801219c77c25d56.jpg@1280w_1l_2o_100sh.jpg",
  },
  text: "",
  content: "",
});

const onClickLeft = (): void => {
  router.push("/message");
};

onMounted(async () => {
  stats.value.user = await getCurrentUser();
  createContent(stats.value.ai, null, defaultMessage);
});

const send = async (): Promise<void> => {
  if (!stats.value.text.trim()) {
    showFailToast("请输入内容");
    return;
  }

  createContent(null, stats.value.user, stats.value.text);
  const res = await myAxios.post("/ai", {
    message: stats.value.text,
  });
  stats.value.text = "";

  if (res.data.code === 0) {
    createContent(stats.value.ai, null, res.data.data);
  }

  await nextTick(() => {
    const lastElement = chatRoom.value?.lastElementChild;
    lastElement?.scrollIntoView();
  });
};

const showUser = (id: number): void => {
  router.push({
    path: "/user/detail",
    query: {
      id: id,
    },
  });
};

const createContent = (remoteUser: AIUser | null, nowUser: User | null, text: string): void => {
  let html = '';

  if (nowUser) {
    html = `
    <div class="message self">
      <div class="myInfo info">
        <img alt="${nowUser.username}" class="avatar" onclick="showUser(${nowUser.id})" src="${nowUser.avatarUrl}">
      </div>
      <p class="text">${text}</p>
    </div>
    `;
  } else if (remoteUser) {
    html = `
    <div class="message other">
      <img alt="${remoteUser.username}" class="avatar" src="${remoteUser.avatarUrl}">
      <div class="info">
        <span class="username">${remoteUser.username.length < 10 ? remoteUser.username : remoteUser.username}&nbsp;&nbsp;&nbsp;</span>
        <p class="text">${text}</p>
      </div>
    </div>
    `;
  }

  stats.value.content += html;
};

// 由于使用了 onclick 内联事件，需要将 showUser 暴露到全局
window.showUser = showUser;

// 为 window 对象添加 showUser 方法的类型声明
declare global {
  interface Window {
    showUser: (id: number) => void;
  }
}
</script>
<style>
.chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.message {
    display: flex;
    align-items: center;
    margin: 10px 10px;
}

.content {
    padding-top: 22px;
    padding-bottom: 57px;
    display: flex;
    flex-direction: column
}

.self {
    align-self: flex-end;
}

.avatar {
    align-self: flex-start;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 10px;
}

.username {
    align-self: flex-start;
    text-align: center;
    max-width: 200px;
    font-size: 12px;
    color: #999;
    padding-bottom: 4px;
    white-space: nowrap;
    overflow: visible;
    background-color: #fff;
}

.info {
    display: flex;
    flex-direction: column;
    order: 2;
}

.myInfo {
    align-self: flex-start;
}

.text {
    padding: 10px;
    border-radius: 10px;
    background-color: #eee;
    word-wrap: break-word;
    word-break: break-all;
}

.other .text {
    align-self: flex-start;
}

.self .text {
    background-color: #0084ff;
    color: #fff;
}
</style>

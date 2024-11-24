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
<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showFailToast } from "vant";

import { getCurrentUser } from "../services/user.ts";
import myAxios, { URL } from "../plugins/my-axios.ts";

const defaultMessage = "你好,我是速配SUPER的智能助手,欢迎问我任何问题。";
const route = useRoute();
const router = useRouter();
const chatRoom = ref(null);
const onClickLeft = () => {
    router.push("/message");
};
const stats = ref({
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
onMounted(async () => {
    stats.value.user = await getCurrentUser();
    createContent(stats.value.ai, null, defaultMessage);
});

const send = async () => {
    if (!stats.value.text.trim()) {
        showFailToast("请输入内容");
    } else {
        createContent(null, stats.value.user, stats.value.text);
        let res = await myAxios.post("/ai", {
            message: stats.value.text,
        });
        stats.value.text = "";
        if (res.data.code === 0) {
            createContent(stats.value.ai, null, res.data.data);
        }
        await nextTick(() => {
            const lastElement = chatRoom.value.lastElementChild;
            lastElement.scrollIntoView();
        });
    }
};

const showUser = (id) => {
    router.push({
        path: "/user/detail",
        query: {
            id: id,
        },
    });
};

/**
 * 这个方法是用来将 json的聊天消息数据转换成 html的。
 */
const createContent = (remoteUser, nowUser, text) => {
    // 当前用户消息
    let html;
    if (nowUser) {
        // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
        html = `
    <div class="message self">
    <div class="myInfo info">
      <img :alt="${nowUser.username}" class="avatar" onclick="showUser(${nowUser.id})" src="${nowUser.avatarUrl}">
    </div>
      <p class="text">${text}</p>
    </div>
`;
    } else if (remoteUser) {
        // remoteUser表示远程用户聊天消息，灰色的气泡
        html = `
     <div class="message other">
      <img :alt="${remoteUser.username}" class="avatar" src="${remoteUser.avatarUrl}">
    <div class="info">
      <span class="username">${remoteUser.username.length < 10 ? remoteUser.username : remoteUser.username}&nbsp;&nbsp;&nbsp;</span>
      <p class="text" >${text}</p>
    </div>
    </div>
`;
    }
    stats.value.content += html;
};
window.showUser = showUser;
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

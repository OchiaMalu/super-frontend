<template>
    <div class="chat-page">
        <!-- 顶部导航栏 -->
        <div class="chat-header">
            <van-nav-bar
                :title="title"
                left-arrow
                @click-left="onClickLeft"
                fixed
            />
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="chatRoom">
            <div v-for="(message, index) in messages" :key="index"
                 :class="['message-item', message.isMy ? 'message-right' : 'message-left']">
                <div class="message-avatar" @click="showUser(message.isMy ? message.fromUser.id : message.fromUser.id)">
                    <img :src="message.isMy ? message.fromUser.avatarUrl : message.fromUser.avatarUrl"
                         :alt="message.isMy ? message.fromUser.username : message.fromUser.username">
                </div>
                <div class="message-content">
                    <div class="message-name" v-if="!message.isMy">
                        <span>{{ message.fromUser.username }}</span>
                        <span class="message-time">{{ message.createTime }}</span>
                    </div>
                    <template v-if="message.messageType === 'image'">
                        <img :src="message.text" class="message-image" @click="previewImage(message.text)" />
                    </template>
                    <template v-else>
                        <div class="message-bubble"
                             :class="{
                                 'admin-message': !message.isMy && message.isAdmin,
                                 'message-right-bubble': message.isMy
                             }">
                            {{ message.text }}
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- 底部输入框 -->
        <div class="chat-input">
            <div class="input-container">
                <van-icon class="emoji-btn" name="smile-o" @click="showEmojiPicker = !showEmojiPicker" />
                <input
                    v-model="inputText"
                    type="text"
                    class="message-input"
                    placeholder="发送消息..."
                    @keypress.enter="send"
                />
                <button
                    v-if="inputText.trim()"
                    class="send-btn"
                    @click="send"
                >
                    发送
                </button>
                <div
                    v-else
                    class="upload-btn"
                    @click="triggerUpload"
                >
                    <van-icon name="plus" />
                    <input
                        type="file"
                        ref="fileInput"
                        accept="image/*"
                        style="display: none"
                        @change="handleImageUpload"
                    />
                </div>
            </div>

            <!-- Emoji选择器 -->
            <div v-if="showEmojiPicker" class="emoji-picker">
                <EmojiPicker @select="onEmojiSelect" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { nextTick, onMounted, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showFailToast, ImagePreview, showImagePreview } from "vant";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";

import { getCurrentUser } from "../services/user.ts";
import myAxios, { URL } from "../plugins/my-axios.ts";

const route = useRoute();
const router = useRouter();
const onClickLeft = () => {
    router.push("/message");
};
const stats = ref({
    user: {
        id: 0,
        username: "",
        avatarUrl: "",
    },
    isCollapse: false,
    users: [],
    chatUser: {
        id: 0,
        username: "",
    },
    chatEnum: {
        // 私聊
        PRIVATE_CHAT: 1,
        // 队伍聊天
        TEAM_CHAT: 2,
        // 大厅
        HALL_CHAT: 3,
    },
    chatType: null,
    team: {
        teamId: 0,
        teamName: "",
    },
    text: "",
    messages: [],
    content: "",
});

let socket = null;
const heartbeatInterval = 30 * 1000; // 30秒
let heartbeatTimer = null;

const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send("PING");
        }
    }, heartbeatInterval);
};

const stopHeartbeat = () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
};

const chatRoom = ref(null);
const DEFAULT_TITLE = "聊天";
const title = ref(DEFAULT_TITLE);
const messages = ref([]);

const showEmojiPicker = ref(false);

const onEmojiSelect = (emoji) => {
    inputText.value += emoji.i;
    showEmojiPicker.value = false;
};

// 点击其他地方关闭emoji选择器
const closeEmojiPicker = (e) => {
    if (!e.target.closest(".emoji-picker") && !e.target.closest(".van-icon-smile-o")) {
        showEmojiPicker.value = false;
    }
};

const fileInput = ref(null);

const triggerUpload = () => {
    fileInput.value.click();
};

const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
        showFailToast("请选择图片文件");
        return;
    }

    // 检查文件大小（例如限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
        showFailToast("图片大小不能超过 5MB");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("file", file);

        // 上传图片到服务器
        const response = await myAxios.post("/common/upload/file", formData);
        const imageUrl = response.data.data;

        // 发送图片消息
        let message = {
            fromId: stats.value.user.id,
            toId: stats.value.chatUser.id,
            text: imageUrl,
            chatType: stats.value.chatType,
            teamId: stats.value.team.teamId,
            messageType: "image",
        };

        socket.send(JSON.stringify(message));

        // 添加自己的图片消息到显示列表
        messages.value.push({
            isMy: true,
            fromUser: stats.value.user,
            text: imageUrl,
            messageType: "image",
            createTime: new Date().toLocaleTimeString(),
        });

        nextTick(() => {
            const chatRoom = document.querySelector(".chat-messages");
            chatRoom.scrollTop = chatRoom.scrollHeight;
        });
    } catch (error) {
        showFailToast("图片上传失败");
    }

    // 清空文件输入框，允许重复选择同一文件
    event.target.value = "";
};

onMounted(async () => {
    let { id, username, userType, teamId, teamName, teamType } = route.query;
    stats.value.chatUser.id = Number.parseInt(id);
    stats.value.team.teamId = Number.parseInt(teamId);
    stats.value.chatUser.username = username;
    stats.value.team.teamName = teamName;
    if (userType && Number.parseInt(userType) === stats.value.chatEnum.PRIVATE_CHAT) {
        stats.value.chatType = stats.value.chatEnum.PRIVATE_CHAT;
        title.value = stats.value.chatUser.username;
    } else if (teamType && Number.parseInt(teamType) === stats.value.chatEnum.TEAM_CHAT) {
        stats.value.chatType = stats.value.chatEnum.TEAM_CHAT;
        title.value = stats.value.team.teamName;
    } else {
        stats.value.chatType = stats.value.chatEnum.HALL_CHAT;
        title.value = "公共聊天室";
    }
    stats.value.user = await getCurrentUser();

    // 加载历史消息
    if (stats.value.chatType === stats.value.chatEnum.PRIVATE_CHAT) {
        const privateMessage = await myAxios.post("/chat/privateChat", {
            toId: stats.value.chatUser.id,
        });
        privateMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.isMy ? chat.fromUser : chat.toUser,
                text: chat.text,
                messageType: chat.messageType,
                createTime: chat.createTime,
            });
        });
    }

    // 大厅聊天
    if (stats.value.chatType === stats.value.chatEnum.HALL_CHAT) {
        const hallMessage = await myAxios.get("/chat/hallChat");
        hallMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.fromUser,
                text: chat.text,
                messageType: chat.messageType,
                isAdmin: chat.isAdmin,
                createTime: chat.createTime,
            });
        });
    }

    // 队伍聊天
    if (stats.value.chatType === stats.value.chatEnum.TEAM_CHAT) {
        const teamMessage = await myAxios.post("/chat/teamChat", {
            teamId: stats.value.team.teamId,
        });
        teamMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.fromUser,
                text: chat.text,
                messageType: chat.messageType,
                isAdmin: chat.isAdmin,
                createTime: chat.createTime,
            });
        });
    }

    init();

    // 使用 nextTick 和 setTimeout 确保在消息渲染完成后滚动
    await nextTick();
    setTimeout(() => {
        const chatRoom = document.querySelector(".chat-messages");
        if (chatRoom) {
            chatRoom.scrollTop = chatRoom.scrollHeight;
        }
    }, 100);

    document.addEventListener("click", closeEmojiPicker);
});

onUnmounted(() => {
    document.removeEventListener("click", closeEmojiPicker);
});

const init = () => {
    let uid = stats.value.user?.id;
    if (typeof (WebSocket) == "undefined") {
        showFailToast("您的浏览器不支持WebSocket");
    } else {
        let socketUrl = "ws://" + URL + "/websocket/" + uid + "/" + stats.value.team.teamId;
        if (socket != null) {
            socket.close();
            socket = null;
        }
        // 开启一个websocket服务
        socket = new WebSocket(socketUrl);
        //打开事件
        socket.onopen = function() {
            startHeartbeat();
        };
        //  浏览器端收消息，获得从服务端发送过来的文本消息
        socket.onmessage = function(msg) {
            if (msg.data === "pong") {
                return;
            }
            // 对收到的json数据进行解析，
            let data = JSON.parse(msg.data);
            if (data.error) {
                showFailToast(data.error);
                return;
            }
            // 获取在线人员信息
            if (data.users) {
                stats.value.users = data.users.filter(user => {
                    return user.id !== uid;
                });
            } else {
                let flag;
                if (stats.value.chatType === data.chatType) {
                    // 单聊
                    flag = (uid === data.toUser?.id && stats.value.chatUser?.id === data.fromUser?.id);
                }
                if ((stats.value.chatType === data.chatType)) {
                    // 大厅
                    flag = (data.fromUser?.id != uid);
                }
                // 队伍
                if (stats.value.chatType === data.chatType && data.teamId && stats.value.team.teamId === data.teamId) {
                    flag = (data.fromUser?.id != uid);
                }
                if (flag) {
                    messages.value.push({
                        isMy: false,
                        fromUser: data.fromUser,
                        text: data.text,
                        messageType: data.messageType,
                        isAdmin: data.isAdmin,
                        createTime: data.createTime,
                    });
                }
                nextTick(() => {
                    const chatRoom = document.querySelector(".chat-messages");
                    chatRoom.scrollTop = chatRoom.scrollHeight;
                });
            }
        };
        //关闭事件
        socket.onclose = function() {
            stopHeartbeat();
            setTimeout(init, 5000); // 5秒后重连
        };
        //发生了错误事件
        socket.onerror = function() {
            showFailToast("发生了错误");
        };
    }
};

const send = () => {
    if (stats.value.chatUser.id === 0) {
        return;
    }
    if (stats.value.chatUser.id === stats.value.user.id) {
        showFailToast("不能给自己发信息");
        return;
    }
    if (!inputText.value.trim()) {
        showFailToast("请输入内容");
        return;
    }

    if (typeof (WebSocket) == "undefined") {
        showFailToast("您的浏览器不支持WebSocket");
        return;
    }

    let message = {
        fromId: stats.value.user.id,
        toId: stats.value.chatUser.id,
        text: inputText.value,
        chatType: stats.value.chatType,
        teamId: stats.value.team.teamId,
    };

    socket.send(JSON.stringify(message));

    // 添加自己的消息到显示列表
    messages.value.push({
        isMy: true,
        fromUser: stats.value.user,
        text: inputText.value,
        createTime: new Date().toLocaleTimeString(),
    });

    inputText.value = "";

    nextTick(() => {
        const chatRoom = document.querySelector(".chat-messages");
        chatRoom.scrollTop = chatRoom.scrollHeight;
    });
};

const showUser = (id) => {
    router.push({
        path: "/user/detail",
        query: {
            id: id,
        },
    });
};

const inputText = ref("");

window.showUser = showUser;

const previewImage = (url) => {
    showImagePreview([url]);
};
</script>
<style>
.chat-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ECECEC;
}

.chat-header {
    height: 46px;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 60px 12px 56px;
    padding-bottom: 80px;
}

.message-item {
    display: flex;
    margin-bottom: 16px;
    gap: 8px;
}

.message-right {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.message-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.message-content {
    max-width: 70%;
    min-width: 0;
}

.message-name {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    max-width: 100%;
}

.message-name span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}

.message-time {
    margin-left: 8px;
    font-size: 11px;
    flex-shrink: 0;
}

.message-bubble {
    padding: 10px 16px;
    border-radius: 16px;
    background-color: #fff;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
    max-width: 100%;
    display: inline-block;
}

.message-right-bubble {
    background-color: #95EC6E;
    color: black;
}

.admin-message {
    background-color: #FFE7BA !important;
    color: #B45F06 !important;
}

.chat-input {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #F7F7F7;
    padding: 8px 12px;
    border-top: 1px solid #eee;
}

.input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #F7F7F7;
    position: relative;
}

.message-input {
    flex: 1;
    height: 36px;
    padding: 8px 12px;
    border: none;
    border-radius: 18px;
    background-color: #FFFFFF;
    font-size: 14px;
    outline: none;
}

.send-btn {
    height: 32px;
    padding: 0 16px;
    border: none;
    border-radius: 16px;
    background-color: #007AFF;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.upload-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #007AFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-btn .van-icon {
    color: #fff;
    font-size: 20px;
}

.emoji-btn {
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    user-select: none;
    display: flex;
    align-items: center;
}

.message-input::placeholder {
    color: #999;
}

.emoji-picker {
    position: absolute;
    bottom: 100%;
    left: 12px;
    z-index: 1000;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

:deep(.emoji-picker) {
    --ep-color-border: #e0e0e0;
    --ep-color-sbg: #f7f7f7;
    width: 300px !important;
    max-height: 320px !important;
}

.message-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    cursor: pointer;
}

.message-bubble.image-message {
    padding: 0;
}
</style>

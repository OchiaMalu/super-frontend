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
                    <div class="message-bubble" 
                         :class="{
                             'admin-message': !message.isMy && message.isAdmin,
                             'message-right-bubble': message.isMy
                         }">
                        {{ message.text }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部输入框 -->
        <div class="chat-input">
            <van-field
                v-model="inputText"
                placeholder="发送消息..."
                :border="false"
                @keypress.enter="send"
            >
                <template #button>
                    <van-button 
                        size="small" 
                        type="primary" 
                        @click="send"
                        :disabled="!inputText.trim()"
                    >发送</van-button>
                </template>
            </van-field>
        </div>
    </div>
</template>
<script setup>
import {nextTick, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {showFailToast} from "vant";

import {getCurrentUser} from "../services/user.ts";
import myAxios, {URL} from "../plugins/my-axios.ts";

const route = useRoute()
const router = useRouter()
const onClickLeft = () => {
    router.push("/message")
};
const stats = ref({
    user: {
        id: 0,
        username: "",
        avatarUrl: ''
    },
    isCollapse: false,
    users: [],
    chatUser: {
        id: 0,
        username: ''
    },
    chatEnum: {
        // 私聊
        PRIVATE_CHAT: 1,
        // 队伍聊天
        TEAM_CHAT: 2,
        // 大厅
        HALL_CHAT: 3
    },
    chatType: null,
    team: {
        teamId: 0,
        teamName: ''
    },
    text: "",
    messages: [],
    content: ''
})

let socket = null;
const heartbeatInterval = 30 * 1000; // 30秒
let heartbeatTimer = null;

const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send("PING");
        }
    }, heartbeatInterval);
}

const stopHeartbeat = () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
}

const chatRoom = ref(null)
const DEFAULT_TITLE = "聊天"
const title = ref(DEFAULT_TITLE)
const messages = ref([])

onMounted(async () => {
    let {id, username, userType, teamId, teamName, teamType} = route.query
    stats.value.chatUser.id = Number.parseInt(id)
    stats.value.team.teamId = Number.parseInt(teamId)
    stats.value.chatUser.username = username
    stats.value.team.teamName = teamName
    if (userType && Number.parseInt(userType) === stats.value.chatEnum.PRIVATE_CHAT) {
        stats.value.chatType = stats.value.chatEnum.PRIVATE_CHAT
        title.value = stats.value.chatUser.username
    } else if (teamType && Number.parseInt(teamType) === stats.value.chatEnum.TEAM_CHAT) {
        stats.value.chatType = stats.value.chatEnum.TEAM_CHAT
        title.value = stats.value.team.teamName
    } else {
        stats.value.chatType = stats.value.chatEnum.HALL_CHAT
        title.value = "公共聊天室"
    }
    stats.value.user = await getCurrentUser()

    // 私聊
    if (stats.value.chatType === stats.value.chatEnum.PRIVATE_CHAT) {
        const privateMessage = await myAxios.post("/chat/privateChat", {
            toId: stats.value.chatUser.id,
        })
        privateMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.isMy ? chat.fromUser : chat.toUser,
                text: chat.text,
                createTime: chat.createTime
            })
        })
    }
    
    // 大厅聊天
    if (stats.value.chatType === stats.value.chatEnum.HALL_CHAT) {
        const hallMessage = await myAxios.get("/chat/hallChat")
        hallMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.fromUser,
                text: chat.text,
                isAdmin: chat.isAdmin,
                createTime: chat.createTime
            })
        })
    }
    
    // 队伍聊天
    if (stats.value.chatType === stats.value.chatEnum.TEAM_CHAT) {
        const teamMessage = await myAxios.post("/chat/teamChat", {
            teamId: stats.value.team.teamId
        })
        teamMessage.data.data.forEach(chat => {
            messages.value.push({
                isMy: chat.isMy,
                fromUser: chat.fromUser,
                text: chat.text,
                isAdmin: chat.isAdmin,
                createTime: chat.createTime
            })
        })
    }
    
    init()
    await nextTick()
    const chatRoom = document.querySelector('.chat-messages')
    chatRoom.scrollTop = chatRoom.scrollHeight
})

const init = () => {
    let uid = stats.value.user?.id;
    if (typeof (WebSocket) == "undefined") {
        showFailToast("您的浏览器不支持WebSocket")
    } else {
        let socketUrl = 'ws://' + URL + '/websocket/' + uid + '/' + stats.value.team.teamId;
        if (socket != null) {
            socket.close();
            socket = null;
        }
        // 开启一个websocket服务
        socket = new WebSocket(socketUrl);
        //打开事件
        socket.onopen = function () {
            startHeartbeat();
        };
        //  浏览器端收消息，获得从服务端发送过来的文本消息
        socket.onmessage = function (msg) {
            if (msg.data === "pong") {
                return;
            }
            // 对收到的json数据进行解析，
            let data = JSON.parse(msg.data)
            if (data.error) {
                showFailToast(data.error)
                return
            }
            // 获取在线人员信息
            if (data.users) {
                stats.value.users = data.users.filter(user => {
                    return user.id !== uid
                })
            } else {
                let flag;
                if (stats.value.chatType === data.chatType) {
                    // 单聊
                    flag = (uid === data.toUser?.id && stats.value.chatUser?.id === data.fromUser?.id)
                }
                if ((stats.value.chatType === data.chatType)) {
                    // 大厅
                    flag = (data.fromUser?.id != uid)
                }
                // 队伍
                if (stats.value.chatType === data.chatType && data.teamId && stats.value.team.teamId === data.teamId) {
                    flag = (data.fromUser?.id != uid)
                }
                if (flag) {
                    messages.value.push({
                        isMy: false,
                        fromUser: data.fromUser,
                        text: data.text,
                        isAdmin: data.isAdmin,
                        createTime: data.createTime
                    })
                }
                nextTick(() => {
                    const chatRoom = document.querySelector('.chat-messages')
                    chatRoom.scrollTop = chatRoom.scrollHeight
                })
            }
        };
        //关闭事件
        socket.onclose = function () {
            stopHeartbeat();
            setTimeout(init, 5000); // 5秒后重连
        };
        //发生了错误事件
        socket.onerror = function () {
            showFailToast("发生了错误")
        }
    }
}

const send = () => {
    if (stats.value.chatUser.id === 0) {
        return;
    }
    if (stats.value.chatUser.id === stats.value.user.id) {
        showFailToast("不能给自己发信息")
        return;
    }
    if (!inputText.value.trim()) {
        showFailToast("请输入内容")
        return;
    }
    
    if (typeof (WebSocket) == "undefined") {
        showFailToast("您的浏览器不支持WebSocket")
        return;
    }
    
    let message = {
        fromId: stats.value.user.id,
        toId: stats.value.chatUser.id,
        text: inputText.value,
        chatType: stats.value.chatType,
        teamId: stats.value.team.teamId,
    }
    
    socket.send(JSON.stringify(message));
    
    // 添加自己的消息到显示列表
    messages.value.push({
        isMy: true,
        fromUser: stats.value.user,
        text: inputText.value,
        createTime: new Date().toLocaleTimeString()
    })
    
    inputText.value = '';
    
    nextTick(() => {
        const chatRoom = document.querySelector('.chat-messages')
        chatRoom.scrollTop = chatRoom.scrollHeight
    })
}

const showUser = (id) => {
    router.push({
        path: '/user/detail',
        query: {
            id: id
        }
    })
}

const inputText = ref('')

window.showUser = showUser
</script>
<style>
.chat-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f7f7f7;
}

.chat-header {
    height: 46px;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 60px 12px 56px;
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
    background-color: #007AFF;
    color: #fff;
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
    background-color: #fff;
    padding: 4px 12px;
    border-top: 1px solid #eee;
}

:deep(.van-field__body) {
    background-color: #f5f5f5;
    border-radius: 20px;
    padding: 2px 12px;
    min-height: 36px;
}

:deep(.van-button--small) {
    height: 32px;
    line-height: 30px;
}
</style>

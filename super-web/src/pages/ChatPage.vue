<template>
    <van-sticky>
        <van-nav-bar
            :title="title"
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
import myAxios, { URL } from "../plugins/my-axios";

interface ChatUser {
  id: number;
  username: string;
  avatarUrl: string;
}

interface ChatMessage {
  fromUser?: ChatUser;
  toUser?: ChatUser;
  text: string;
  isAdmin?: boolean;
  createTime?: string;
  isMy?: boolean;
  teamId?: number;
  chatType?: number;
}

interface ChatStats {
  user: ChatUser;
  isCollapse: boolean;
  users: ChatUser[];
  chatUser: {
    id: number;
    username: string;
  };
  chatEnum: {
    PRIVATE_CHAT: number;
    TEAM_CHAT: number;
    HALL_CHAT: number;
  };
  chatType: number | null;
  team: {
    teamId: number;
    teamName: string;
  };
  text: string;
  messages: ChatMessage[];
  content: string;
}

// 响应式状态定义
const stats = ref<ChatStats>({
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
    PRIVATE_CHAT: 1,
    TEAM_CHAT: 2,
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
});

const route = useRoute();
const router = useRouter();
const chatRoom = ref<HTMLElement | null>(null);
const DEFAULT_TITLE = "聊天";
const title = ref<string>(DEFAULT_TITLE);

let socket: WebSocket | null = null;
const heartbeatInterval = 30 * 1000; // 30秒
let heartbeatTimer: number | null = null;

// WebSocket心跳处理
const startHeartbeat = (): void => {
  heartbeatTimer = window.setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send("PING");
    }
  }, heartbeatInterval);
};

const stopHeartbeat = (): void => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

// 导航处理
const onClickLeft = (): void => {
  router.push("/message");
};

// 创建消息内容
const createContent = (
  remoteUser: ChatUser | null, 
  nowUser: ChatUser | null, 
  text: string, 
  isAdmin?: boolean, 
  createTime?: string
): void => {
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
        <img alt="${remoteUser.username}" class="avatar" onclick="showUser(${remoteUser.id})" src="${remoteUser.avatarUrl}">
        <div class="info">
          <span class="username">${remoteUser.username.length < 10 ? remoteUser.username : remoteUser.username}&nbsp;&nbsp;&nbsp;${createTime || ''}</span>
          <p class="${isAdmin ? 'admin text' : 'text'}">${text}</p>
        </div>
      </div>
    `;
  }
  
  stats.value.content += html;
};

// WebSocket初始化
const init = (): void => {
  const uid = stats.value.user?.id;
  if (typeof WebSocket === "undefined") {
    showFailToast("您的浏览器不支持WebSocket");
    return;
  }

  const socketUrl = `wss://${URL}/websocket/${uid}/${stats.value.team.teamId}`;
  
  if (socket) {
    socket.close();
    socket = null;
  }

  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    startHeartbeat();
  };

  socket.onmessage = (msg) => {
    if (msg.data === "pong") return;

    try {
      const data = JSON.parse(msg.data);
      
      if (data.error) {
        showFailToast(data.error);
        return;
      }

      if (data.users) {
        stats.value.users = data.users.filter((user: ChatUser) => user.id !== uid);
      } else {
        handleChatMessage(data, uid);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  };

  socket.onclose = () => {
    stopHeartbeat();
    setTimeout(init, 5000); // 5秒后重连
  };

  socket.onerror = () => {
    showFailToast("发生了错误");
  };
};

// 处理聊天消息
const handleChatMessage = (data: ChatMessage, uid: number): void => {
  let flag = false;
  
  if (stats.value.chatType === data.chatType) {
    if (data.chatType === stats.value.chatEnum.PRIVATE_CHAT) {
      flag = (uid === data.toUser?.id && stats.value.chatUser?.id === data.fromUser?.id);
    } else if (data.chatType === stats.value.chatEnum.HALL_CHAT) {
      flag = (data.fromUser?.id !== uid);
    } else if (data.teamId && stats.value.team.teamId === data.teamId) {
      flag = (data.fromUser?.id !== uid);
    }
  }

  if (flag) {
    stats.value.messages.push(data);
    createContent(data.fromUser, null, data.text, data.isAdmin, data.createTime);
    
    nextTick(() => {
      const lastElement = chatRoom.value?.lastElementChild;
      lastElement?.scrollIntoView();
    });
  }
};

// 发送消息
const send = (): void => {
  if (!stats.value.chatUser.id || stats.value.chatUser.id === stats.value.user.id) {
    showFailToast("不能给自己发信息");
    return;
  }

  if (!stats.value.text.trim()) {
    showFailToast("请输入内容");
    return;
  }

  if (typeof WebSocket === "undefined") {
    showFailToast("您的浏览器不支持WebSocket");
    return;
  }

  const message = {
    fromId: stats.value.user.id,
    toId: stats.value.chatUser.id,
    text: stats.value.text,
    chatType: stats.value.chatType,
    teamId: stats.value.team.teamId,
  };

  socket?.send(JSON.stringify(message));
  stats.value.messages.push({ user: stats.value.user.id, text: stats.value.text });
  createContent(null, stats.value.user, stats.value.text);
  stats.value.text = '';

  nextTick(() => {
    const lastElement = chatRoom.value?.lastElementChild;
    lastElement?.scrollIntoView();
  });
};

// 用户导航
const showUser = (id: number): void => {
  router.push({
    path: '/user/detail',
    query: { id }
  });
};

// 暴露给window对象
window.showUser = showUser;

// 生命周期钩子
onMounted(async () => {
  const { id, username, userType, teamId, teamName, teamType } = route.query;
  
  stats.value.chatUser.id = Number(id);
  stats.value.team.teamId = Number(teamId);
  stats.value.chatUser.username = username as string;
  stats.value.team.teamName = teamName as string;

  if (userType && Number(userType) === stats.value.chatEnum.PRIVATE_CHAT) {
    stats.value.chatType = stats.value.chatEnum.PRIVATE_CHAT;
    title.value = stats.value.chatUser.username;
  } else if (teamType && Number(teamType) === stats.value.chatEnum.TEAM_CHAT) {
    stats.value.chatType = stats.value.chatEnum.TEAM_CHAT;
    title.value = stats.value.team.teamName;
  } else {
    stats.value.chatType = stats.value.chatEnum.HALL_CHAT;
    title.value = "公共聊天室";
  }

  stats.value.user = await getCurrentUser();

  await loadInitialMessages();
  init();

  await nextTick();
  const lastElement = chatRoom.value?.lastElementChild;
  lastElement?.scrollIntoView();
});

// 加载初始消息
const loadInitialMessages = async (): Promise<void> => {
  try {
    if (stats.value.chatType === stats.value.chatEnum.PRIVATE_CHAT) {
      const privateMessage = await myAxios.post("/chat/privateChat", {
        toId: stats.value.chatUser.id,
      });
      
      privateMessage.data.data.forEach((chat: ChatMessage) => {
        if (chat.isMy) {
          createContent(null, chat.fromUser, chat.text);
        } else {
          createContent(chat.toUser, null, chat.text, null, chat.createTime);
        }
      });
    } else if (stats.value.chatType === stats.value.chatEnum.HALL_CHAT) {
      const hallMessage = await myAxios.get("/chat/hallChat");
      
      hallMessage.data.data.forEach((chat: ChatMessage) => {
        if (chat.isMy) {
          createContent(null, chat.fromUser, chat.text);
        } else {
          createContent(chat.fromUser, null, chat.text, chat.isAdmin, chat.createTime);
        }
      });
    } else if (stats.value.chatType === stats.value.chatEnum.TEAM_CHAT) {
      const teamMessage = await myAxios.post("/chat/teamChat", {
        teamId: stats.value.team.teamId
      });
      
      teamMessage.data.data.forEach((chat: ChatMessage) => {
        if (chat.isMy) {
          createContent(null, chat.fromUser, chat.text);
        } else {
          createContent(chat.fromUser, null, chat.text, chat.isAdmin, chat.createTime);
        }
      });
    }
  } catch (error) {
    console.error('Failed to load initial messages:', error);
    showFailToast("加载消息失败，请稍后重试");
  }
};
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

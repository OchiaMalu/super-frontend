<template>
    <van-row justify="center">
        <van-image :src="user?.avatarUrl" round width="128" height="128"/>
    </van-row>
    <van-cell-group inset style="margin-top: 20px">
        <van-cell title="昵称" :value="user?.username"/>
        <van-cell title="标签">
            <template #value>
                <template v-if="user?.tags?.length">
                    <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px">
                        {{ tag }}
                    </van-tag>
                </template>
                <span v-else>该用户暂未填写标签</span>
            </template>
        </van-cell>
        <van-cell title="个性签名">
            <template #value>
                <van-text-ellipsis :content="user?.profile || '该用户暂未填写个性签名'"/>
            </template>
        </van-cell>
        <van-cell title="性别">
            <span v-if="user?.gender === 1">男</span>
            <span v-else-if="user?.gender === 0">女</span>
            <span v-else-if="user?.gender === 2">保密</span>
            <span v-else>该用户暂未填写性别</span>
        </van-cell>
        <van-cell title="邮箱" :value="user?.email || '该用户暂未填写邮箱'"/>
        <van-cell v-if="user?.id !== currentUser?.id" title="他的博文" is-link @click="toBlog(user?.id)"/>
        <van-cell v-if="user?.id !== currentUser?.id" title="他创建的队伍" is-link @click="toTeam(user?.id)"/>
    </van-cell-group>
    <div style="margin: 16px">
        <div v-if="user?.id !== currentUser?.id">
            <van-button v-if="user?.isFollow" style="width: 100%" plain round type="primary" color="#c1c1c1"
                        @click="followUser">
                已关注
            </van-button>
            <van-button v-else style="width: 100%" plain round type="primary" @click="followUser">关注</van-button>
            <van-button style="width: 100%;margin-top: 10px" plain round type="primary" @click="toChat">
                私聊
            </van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {showSuccessToast} from "vant";
import myAxios from "../../plugins/my-axios";
import {getCurrentUser} from "../../services/user";

interface User {
    id: number;
    username: string;
    tags: string[];
    profile?: string;
    gender?: 0 | 1 | 2;
    email?: string;
    avatarUrl?: string;
    isFollow?: boolean;
}
const user = ref<User | null>(null);
const currentUser = ref<User | null>(null);

const route = useRoute();
const router = useRouter();

// 关注用户
const followUser = async (): Promise<void> => {
    try {
        if (!user.value?.id) return;
        
        const res = await myAxios.post(`/follow/${user.value.id}`);
        if (res?.data.code === 0) {
            const res_ = await myAxios.get(`/user/${user.value.id}`);
            if (res_.data.code === 0) {
                user.value.isFollow = res_.data.data.isFollow;
            }
        }
    } catch (error) {
        console.error('Failed to follow user:', error);
    }
};

// 跳转到聊天
const toChat = (): void => {
    if (!user.value) return;
    
    router.push({
        path: "/chat",
        query: {
            id: user.value.id,
            username: user.value.username,
            userType: 1
        }
    });
};

// 生命周期钩子
onMounted(async () => {
    try {
        currentUser.value = await getCurrentUser();
        const res = await myAxios.get(`/user/${route.query.id}`);
        
        if (res?.data.code === 0) {
            const userData = res.data.data;
            if (userData.tags) {
                userData.tags = JSON.parse(userData.tags);
            }
            user.value = userData;
        }
    } catch (error) {
        console.error('Failed to fetch user details:', error);
    }
});

const toBlog = (id: number): void => {
    router.push({
        path: "/user/blog",
        query: {
            id: id
        }
    });
};

const toTeam = (id: number): void => {
    router.push({
        path: "/user/team/create",
        query: {
            id: id
        }
    });
};
</script>

<style scoped>

</style>

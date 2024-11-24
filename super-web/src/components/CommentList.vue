<template>
    <van-cell-group v-for="comment in props.commentList" :border="false" style="margin-left: 5px;margin-right: 5px">
        <van-cell center :border="false" :title="comment.commentUser.username"
                  :label="new Date(comment.createdTime).toLocaleString()">
            <template #icon>
                <van-image
                    round
                    width="40"
                    height="40"
                    style="margin-right: 10px"
                    :src="comment.commentUser.avatarUrl"
                />
            </template>
            <template #value>
                <van-icon v-if="!comment.isLiked" name="good-job-o" size="15" @click="likeComment(comment)">
                    {{ comment.likedNum }}
                </van-icon>
                <van-icon v-else name="good-job-o" color="red" size="15" @click="likeComment(comment)">
                    {{ comment.likedNum }}
                </van-icon>
                <van-icon v-if="currentUser?.id === comment.commentUser.id || currentUser?.role === 1" name="delete-o"
                          size="15" style="margin-left: 10px" @click="deleteComment(comment.id)" />
            </template>
        </van-cell>
        <div style="display: block;width: 80%;word-wrap: break-word;margin-left: 55px">
            {{ comment.content }}
        </div>
    </van-cell-group>

</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { showConfirmDialog, showFailToast } from "vant";
import myAxios from "../plugins/my-axios";
import { getCurrentUser } from "../services/user";
import type { CommentType } from "../models/comment";

interface User {
    id: number;
    role: number;
    // 根据实际用户对象添加其他属性
}

interface Props {
    commentList: CommentType[];
}

// 定义 props 和 emits
const props = defineProps<Props>();
const emits = defineEmits(["refresh"]);

// 响应式状态定义
const currentUser = ref<User | null>(null);

// 点赞评论
const likeComment = async (comment: CommentType): Promise<void> => {
    try {
        const res = await myAxios.put(`/comments/like/${comment.id}`);
        if (res?.data.code === 0) {
            const res_ = await myAxios.get(`/comments/${comment.id}`);
            if (res_?.data.code === 0) {
                comment.likedNum = res_.data.data.likedNum;
                comment.isLiked = res_.data.data.isLiked;
            }
        }
    } catch (error) {
        console.error("Failed to like comment:", error);
        showFailToast("操作失败，请稍后重试");
    }
};

// 删除评论
const deleteComment = async (id: number): Promise<void> => {
    try {
        await showConfirmDialog({
            title: "确定要删除评论吗",
            message: "此操作无法撤回",
        });

        const res = await myAxios.delete(`/comments/${id}`);
        if (res?.data.code === 0) {
            emits("refresh");
        } else {
            showFailToast(`删除失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch {
        // 用户取消删除操作
    }
};

// 生命周期钩子
onMounted(async () => {
    try {
        currentUser.value = await getCurrentUser();
    } catch (error) {
        console.error("Failed to get current user:", error);
        showFailToast("获取用户信息失败");
    }
});
</script>

<style scoped>

</style>

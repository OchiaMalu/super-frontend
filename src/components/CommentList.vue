<template>
    <van-cell-group v-for="comment in props.commentList" :border="false" style="margin-left: 5px;margin-right: 5px">
        <van-cell center :title="comment.commentUser.username" :label="comment.createTime">
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
            </template>
        </van-cell>
        <div style="display: block;width: 80%;word-wrap: break-word;margin-left: 50px">
            {{ comment.content }}
        </div>
    </van-cell-group>

</template>

<script setup lang="ts">
import {CommentType} from "../models/comment.d.ts";
import myAxios from "../plugins/my-axios.js";

interface BlogCommentsProps {
    commentList: CommentType[]
}

let props = defineProps<BlogCommentsProps>();

const likeComment = async (comment) => {
    let res = await myAxios.put("/comments/like/" + comment.id);
    if (res?.data.code === 0) {
        let res_ = await myAxios.get("/comments/" + comment.id);
        if (res_?.data.code === 0) {
            comment.likedNum = res_.data.data.likedNum
            comment.isLiked = res_.data.data.isLiked
        }
    }
}
</script>

<style scoped>

</style>

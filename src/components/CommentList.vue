<template>
    <van-cell-group v-for="comment in props.commentList">
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
                <van-icon name="good-job-o" size="15">
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

interface BlogCommentsProps {
    commentList: CommentType[]
}

let props = defineProps<BlogCommentsProps>();

</script>

<style scoped>

</style>

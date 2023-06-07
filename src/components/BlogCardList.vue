<template>
    <van-cell-group>
        <van-cell
            v-for="blog in props.blogList"
            :title="blog.title"
            @click="toBlog(blog.id)">
            <template #right-icon>
                <van-image src="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg" width="88px"/>
            </template>
            <template #title>
                <span style="margin-left: 20px">{{ blog.title }}</span>
            </template>
            <template #value>
                <div style="margin-top: 60px;margin-right: 10px">
                    <van-icon name="envelop-o" size="14" style="margin-right: 5px">
                        <span style="margin-left: 2px">{{ blog.commentsNum }}</span>
                    </van-icon>
                </div>
            </template>
            <template #label>
                <span style="margin-left: 20px">{{ blog.createTime }}</span>
            </template>
        </van-cell>
    </van-cell-group>
</template>

<script setup lang="ts">
import {BlogType} from "../models/blog.js";
import {useRouter} from "vue-router";

interface BlogCardListProps {
    blogList: BlogType[]
}

let props = defineProps<BlogCardListProps>();
let router = useRouter();
const toBlog = (blogId) => {
    router.push({
        path: '/blog',
        query: {
            id: blogId
        }
    })
}
</script>

<style scoped>
:deep(.van-cell__label) {
    margin-top: 38px;
}

:deep(.van-cell) {
    padding-left: 0;
    padding-right: 0;
}
</style>
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
                    <van-icon name="good-job-o" v-if="!blog.isLike" size="14" @click="likeBlog(blog)">
                        <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                    </van-icon>
                    <van-icon name="good-job-o" v-else color="red" size="14" @click="likeBlog(blog)">
                        <span style="margin-left: 2px">{{ blog.likedNum }}</span>
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
import myAxios from "../plugins/my-axios.js";
import {useRouter} from "vue-router";

interface BlogCardListProps {
    blogList: BlogType[]
}

let props = defineProps<BlogCardListProps>();
const likeBlog = async (blog) => {
    let res = await myAxios.put("/blog/like/" + blog.id);
    if (res?.data.code === 0) {
        let res_ = await myAxios.get("/blog/" + blog.id);
        if (res_?.data.code === 0) {
            blog.likedNum = res_.data.data.likedNum
            blog.isLike = res_.data.data.isLike
        }
    }
}
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
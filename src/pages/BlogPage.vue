<template>
    <van-sticky>
        <van-nav-bar
                title="正文"
                left-arrow
                @click-left="onClickLeft"
        >
        </van-nav-bar>
    </van-sticky>
    <div style="width: 100%;height: 10px;background-color: black"/>
    <van-swipe :autoplay="3000" lazy-render style="height: 200px">
        <van-swipe-item v-for="image in images" :key="image">
            <img :src="image" style="height: 200px;width: 100%"/>
        </van-swipe-item>
    </van-swipe>
    <div style="width: 100%;height: 10px;background-color: black"/>

    <van-cell :title="blog.title" title-style="font-size:18px;margin-left: 10px;"/>

    <van-cell center :title="author.username">
        <template #icon>
            <van-image :src="author.avatarUrl" width="50" round style="margin-left: 10px;margin-right: 10px"/>
        </template>
        <template #right-icon>
            <van-button icon="plus" type="primary" size="small">关注</van-button>
        </template>
    </van-cell>

    <van-cell :title="blog.content" title-style="margin-left: 10px"/>

    <van-cell-group inset>
        <van-field v-model="comment" placeholder="评论" style="position: fixed;bottom: 0">
            <template #right-icon>
                <van-icon class-prefix="my-icon" name="shangchuan" size="30" color="#4387f6"/>
            </template>
            <template #button>
                <van-icon name="envelop-o" size="15" style="margin-right: 5px">
                    <span style="margin-left: 2px">{{ blog.commentsNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-if="!blog.isLike" size="15" @click="likeBlog(blog)">
                    <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-else color="red" size="15" @click="likeBlog(blog)"
                          style="margin-right: 10px">
                    <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                </van-icon>
            </template>
        </van-field>
    </van-cell-group>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import myAxios from "../plugins/my-axios.js";

let router = useRouter();
const comment = ref()
const onClickLeft = () => {
    router.push("/")
};
const images = [
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
];
let route = useRoute();
const blog = ref({});
const author = ref({})
onMounted(async () => {
    let id = route.query.id;
    let res = await myAxios.get("/blog/" + id);
    if (res?.data.code === 0) {
        blog.value = res.data.data
        author.value = res.data.data.author
    }
})
</script>

<style scoped>
:deep(.van-field__value) {
    margin-right: 15px;
}
</style>
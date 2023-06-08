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

    <van-cell-group inset>
        <van-cell :title="blog.title" title-style="font-size:18px"/>
        <van-cell center :title="author.username">
            <template #icon>
                <van-image :src="author.avatarUrl" width="40" round/>
            </template>
            <template #right-icon>
                <van-button icon="plus" type="primary" size="small">关注</van-button>
            </template>
        </van-cell>
        <van-cell :title="blog.content"/>
    </van-cell-group>

    <van-divider/>
    <van-cell-group inset>
        <!--        todo 排序-->
        <van-cell :title="`评论 ${blog.commentsNum}`" value="热门"/>
    </van-cell-group>
    <div class="line"></div>

    <div style="padding-bottom: 80px">
        <comment-list :comment-list="commentList"/>
    </div>


    <van-cell-group>
        <van-field v-model="comment" :autosize="{minHeight: 32}" type="textarea" rows="1" placeholder="评论"
                   style="position: fixed;bottom: 0;padding-left: 16px;border-top: 1px solid #C1C1C1;padding-right: 10px">
            <template #right-icon>
                <van-icon class-prefix="my-icon" name="shangchuan" size="30" color="#4387f6" @click="addComment"/>
            </template>
            <template #button>
                <van-icon name="envelop-o" size="15" style="margin-right: 5px">
                    <span style="margin-left: 2px">{{ blog.commentsNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-if="!blog.isLike" size="15" @click="likeBlog(blog)">
                    <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-else color="red" size="15" @click="likeBlog(blog)"
                          style="margin-right: 2px">
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
import CommentList from "../components/CommentList.vue";
import {showFailToast, showSuccessToast} from "vant";

let router = useRouter();
const comment = ref("")
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
const commentList = ref([])
const listComments = async () => {
    let id = route.query.id;
    let commentRes = await myAxios.get("/comments?blogId=" + id);
    if (commentRes?.data.code === 0) {
        commentList.value = commentRes.data.data
    }
}
onMounted(async () => {
    let id = route.query.id;
    let res = await myAxios.get("/blog/" + id);
    if (res?.data.code === 0) {
        blog.value = res.data.data
        author.value = res.data.data.author
    }
    await listComments()
})
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
const addComment = async () => {
    if (comment.value === "") {
        showFailToast("请输入评论内容")
    } else {
        let res = await myAxios.post("/comments/add", {
            blogId: blog.value.id,
            content: comment.value
        });
        if (res?.data.code === 0) {
            showSuccessToast("添加成功")
        } else {
            showFailToast("添加失败," + res.data.description)
        }
        await listComments()
        comment.value = ""

        let id = route.query.id;
        let newBlogRes = await myAxios.get("/blog/" + id);
        if (newBlogRes?.data.code === 0) {
            blog.value.commentsNum = newBlogRes.data.data.commentsNum
        }
    }
}
</script>

<style scoped>
:deep(.van-field__value) {
    margin-right: 15px;
}

.line {
    width: 100%;
    height: 1px;
    background: #ededed;
    position: relative;
}

.line::after {
    position: absolute;
    top: 0;
    left: 0;
    content: " ";
    display: block;
    width: 10%;
    height: 100%;
    background-color: #39a9ed;
}
</style>

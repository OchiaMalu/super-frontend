<template>
    <div style="position: relative;height: 100%;width: 100%">
        <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
            <van-swipe-item>1</van-swipe-item>
            <van-swipe-item>2</van-swipe-item>
            <van-swipe-item>3</van-swipe-item>
            <van-swipe-item>4</van-swipe-item>
        </van-swipe>
        <van-tabs v-model:active="active">
            <van-tab title="匹配用户">
                <van-pull-refresh
                        v-model="refreshLoading"
                        success-text="刷新成功"
                        @refresh="onRefresh">
                    <van-list
                            v-model:loading="listLoading"
                            :finished="listFinished"
                            offset="0"
                            finished-text="没有更多了"
                            @load="onLoad"
                            style="margin: 15px"
                    >
                        <UserCardList :user-list="userList"/>
                    </van-list>
                    <van-back-top right="20px" bottom="60px"/>
                    <van-empty v-if="(!userList ||　userList.length===0) && !listLoading" image="search"
                               description="暂无用户"/>
                </van-pull-refresh>
            </van-tab>
            <van-tab title="热门贴文">
                <van-list
                        v-model:loading="listLoading"
                        :finished="blogListFinished"
                        offset="0"
                        finished-text="没有更多了"
                        @load="blogLoad"
                        style="margin: 15px"
                >
                    <van-cell-group>
                        <van-cell
                            v-for="blog in blogList"
                            :title="blog.title">
                            <template #right-icon>
                                <van-image src="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg" width="88px"/>
                            </template>
                            <template #title>
                                <span style="margin-left: 20px">{{ blog.title}}</span>
                            </template>
                            <template #value>
                                <div style="margin-top: 60px;margin-right: 10px">
                                    <van-icon name="envelop-o" size="14" style="margin-right: 5px">
                                        <span style="margin-left: 2px">{{blog.commentsNum}}</span>
                                    </van-icon>
                                    <van-icon name="good-job-o" size="14">
                                        <span style="margin-left: 2px">{{blog.likedNum}}</span>
                                    </van-icon>
                                </div>
                            </template>
                            <template #label>
                                <span style="margin-left: 20px">{{blog.createTime}}</span>
                            </template>
                        </van-cell>
                    </van-cell-group>
                </van-list>
            </van-tab>
        </van-tabs>

    </div>


</template>
<script setup>
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import UserCardList from "../components/UserCardList.vue";

const listLoading = ref(false)
const listFinished = ref(false)
const userList = ref([])
const refreshLoading = ref(false)
const currentPage = ref(0)
const active = ref(0)
const blogList = ref([])
const blogListFinished = ref(false)
const blogCurrentPage = ref(0)

const blogLoad = async () => {
    blogCurrentPage.value++
    await getBlogList(blogCurrentPage.value)
}

const getBlogList = async (currentPage) => {
    let res = await myAxios.get("/blog/list?currentPage=" + currentPage);
    if (res?.data.code === 0) {
        if (res.data.data.records.length > 0) {
            res.data.data.records.forEach(item => blogList.value.push(item))
        } else {
            blogListFinished.value = true
        }
        listLoading.value=false
    }
}

async function getUserList(currentPage) {
    const userListData = await myAxios.get("/user/match", {
        params: {
            currentPage: currentPage
        }
    })
    if (userListData?.data.code === 0) {
        showSuccessToast("加载成功")
    } else {
        showFailToast("加载失败")
    }
    if (userListData?.data.data.records.length === 0) {
        listFinished.value = true
        return
    }
    if (userListData?.data.data.records) {
        userListData.data.data.records.forEach(user => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        for (let i = 0; i < userListData.data.data.records.length; i++) {
            userList.value.push(userListData.data.data.records[i])
        }
    }
}

const onLoad = async () => {
    currentPage.value++
    await getUserList(currentPage.value)
    listLoading.value = false;
}
const onRefresh = async () => {
    currentPage.value = 1
    userList.value = []
    listFinished.value = false
    await getUserList(currentPage.value)
    refreshLoading.value = false
    listLoading.value = false;
}


</script>

<style scoped>
.my-swipe .van-swipe-item {
    color: #fff;
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #39a9ed;
}

.my-swipe {
    margin: 15px;
    border-radius: 3%;
}

:deep(.van-cell__label){
    margin-top: 38px;
}
:deep(.van-cell){
    padding-left: 0;
    padding-right: 0;
}
</style>
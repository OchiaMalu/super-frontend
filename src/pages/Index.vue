<template>
  <van-notice-bar
      color="#1989fa"
      background="#ecf9ff"
      left-icon="volume-o"
      style="margin-bottom: 10px"
      text="富强、民主、文明、和谐；自由、平等、公正、法治；爱国、敬业、诚信、友善。"
  />
    <div style="position: relative;height: 100%;width: 100%">
        <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white" lazy-render
                   style="width: 90%;height: 150px;margin: 0 auto">
            <van-swipe-item v-for="image in images" :key="image">
                <img :src="image" style="width: 100%;height: 150px"/>
            </van-swipe-item>
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
            <van-tab title="热门博文">
                <van-pull-refresh
                        v-model="refreshLoading"
                        success-text="刷新成功"
                        @refresh="blogRefresh">
                    <van-list
                            v-model:loading="listLoading"
                            :finished="blogListFinished"
                            offset="0"
                            finished-text="没有更多了"
                            @load="blogLoad"
                        style="margin: 15px"
                    >
                        <blog-card-list :blog-list="blogList"/>
                    </van-list>
                    <van-back-top right="20px" bottom="60px"/>
                    <van-empty v-if="(!blogList ||　blogList.length===0) && !listLoading" image="search"
                               description="暂无博文"/>
                </van-pull-refresh>
            </van-tab>
        </van-tabs>

    </div>


</template>
<script setup>
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import UserCardList from "../components/UserCardList.vue";
import BlogCardList from "../components/BlogCardList.vue";

const listLoading = ref(false)
const listFinished = ref(false)
const userList = ref([])
const refreshLoading = ref(false)
const currentPage = ref(0)
const active = ref(0)
const blogList = ref([])
const blogListFinished = ref(false)
const blogCurrentPage = ref(0)
const images = [
    "http://niu.ochiamalu.xyz/tgy2.jpg",
    "http://niu.ochiamalu.xyz/quanmiantuidongdangdeershidajingshen.jpg",
    "http://niu.ochiamalu.xyz/banner_2020112601.jpg",
    "http://niu.ochiamalu.xyz/20220301.jpg"
]
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
        listLoading.value = false
    }
}

async function getUserList(currentPage) {
    const userListData = await myAxios.get("/user/match", {
        params: {
            currentPage: currentPage
        }
    })
    if (userListData?.data.code === 0) {
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

const blogRefresh = async () => {
    blogCurrentPage.value = 1
    blogList.value = []
    blogListFinished.value = false
    await getBlogList(blogCurrentPage.value)
    refreshLoading.value = false
    listLoading.value = false
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


</style>

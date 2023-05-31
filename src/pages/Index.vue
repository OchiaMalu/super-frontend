<template>
    <div style="position: relative;height: 100%;width: 100%">
<!--        <div style="margin-top: 50%" v-if="onLoading">-->
<!--            <van-loading vertical >-->
<!--                <template #icon>-->
<!--                    <van-icon name="star-o" size="30"/>-->
<!--                </template>-->
<!--                加载中...-->
<!--            </van-loading>-->
<!--        </div>-->
        <van-pull-refresh
                v-model="refreshLoading"
                success-text="刷新成功"
                @refresh="onRefresh"
        >
            <van-list
                    v-model:loading="listLoading"
                    :finished="listFinished"
                    offset="0"
                    finished-text="没有更多了"
                    @load="onLoad"
            >
                <UserCardList :user-list="userList"/>
            </van-list>
            <van-back-top right="20px" bottom="60px" />
            <van-empty v-if="(!userList ||　userList.length===0) && !listLoading" image="search" description="暂无用户"/>
        </van-pull-refresh>
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
    if (userListData?.data.data.length===0) {
        listFinished.value = true
        return
    }
    if (userListData?.data.data) {
        userListData.data.data.forEach(user => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        for (let i = 0; i < userListData.data.data.length; i++) {
            userList.value.push(userListData.data.data[i])
        }
    }
}

// onMounted(async () => {
//     await getUserList();
//     onLoading.value = false
// })
const onLoad = async () => {
    currentPage.value++
    await getUserList(currentPage.value)
    listLoading.value = false;
}
const onRefresh = async () => {
    currentPage.value = 1
    userList.value = []
    await getUserList(currentPage.value)
    refreshLoading.value = false
    listLoading.value = false;
}


</script>

<style scoped>

</style>
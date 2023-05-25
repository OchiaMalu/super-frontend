<template>
    <div style="position: relative;height: 100%;width: 100%">
        <van-pull-refresh
                v-model="refreshLoading"
                success-text="刷新成功"
                @refresh="onRefresh"
        >
            <UserCardList :user-list="userList"/>
            <van-empty v-if="(!userList ||　userList.length===0) && !onLoading" image="search" description="暂无用户"/>
            <div style="margin-top: 50%" v-if="onLoading">
                <van-loading vertical >
                    <template #icon>
                        <van-icon name="star-o" size="30"/>
                    </template>
                    加载中...
                </van-loading>
            </div>
        </van-pull-refresh>
    </div>


</template>
<script setup>
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import UserCardList from "../components/UserCardList.vue";

const userList = ref([])
const onLoading = ref(true)
const refreshLoading = ref(false)
const onRefresh = async () => {
    const userListData = await myAxios.get("/user/recommend", {
        params: {
            currentPage: 1
        }
    })
    refreshLoading.value = false
    if (userListData?.data.code === 0) {
        showSuccessToast("加载成功")
    } else {
        showFailToast("加载失败")
    }
    if (userListData?.data.data.records) {
        userListData.data.data.records.forEach(user => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        userList.value = userListData.data.data.records
    }
}
onMounted(async () => {
    const userListData = await myAxios.get("/user/recommend", {
        params: {
            currentPage: 1
        }
    })
    onLoading.value = false
    if (userListData?.data.code === 0) {
        showSuccessToast("加载成功")
    } else {
        showFailToast("加载失败")
    }
    if (userListData?.data.data.records) {
        userListData.data.data.records.forEach(user => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        userList.value = userListData.data.data.records
    }
})
</script>

<style scoped>

</style>
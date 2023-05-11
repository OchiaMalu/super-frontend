<template>
    <UserCardList user-list="userList"/>
    <van-empty v-if="!userList ||　userList.length===0" image="search" description="暂无用户"/>
</template>

<script setup>
import {onMounted} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import UserCardList from "../components/UserCardList.vue";

onMounted(async () => {
    const userListData = await myAxios.get("/user/search/recommend", {})
        .then(function (resp) {
            showSuccessToast("搜索成功")
            return resp.data?.data
        }).catch(function () {
            showFailToast("内部错误")
        })
    if (userListData) {
        userListData.forEach(user => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        userList.value = userListData
    }
})
</script>

<style scoped>

</style>
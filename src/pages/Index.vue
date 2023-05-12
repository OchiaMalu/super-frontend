<template>
    <UserCardList :user-list="userList"/>
    <van-empty v-if="(!userList ||　userList.length===0) && !onloading" image="search" description="暂无用户"/>
    <van-loading vertical v-if="onloading">
        <template #icon>
            <van-icon name="star-o" size="30"/>
        </template>
        加载中...
    </van-loading>
</template>
<script setup>
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import UserCardList from "../components/UserCardList.vue";

const userList = ref([])
const onloading = ref(true)
onMounted(async () => {
    const userListData = await myAxios.get("/user/recommend", {
        params: {
            currentPage: 1
        }
    })
        .then(function (resp) {
            showSuccessToast("搜索成功")
            return resp.data?.data.records
        }).catch(function () {
            showFailToast("内部错误")
        })
    onloading.value=false
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
<template>
    <div style="position: relative;height: 100%;width: 100%">
        <UserCardList :user-list="userList"/>
        <van-empty v-if="(!userList ||　userList.length===0) && !onloading" image="search"
                   description="暂无符合要求的用户"/>
        <div style="margin-top: 50%" v-if="onloading">
            <van-loading vertical>
                <template #icon>
                    <van-icon name="star-o" size="30"/>
                </template>
                加载中...
            </van-loading>
        </div>
    </div>
</template>

<script setup>
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast, showToast} from "vant";
import qs from 'qs';
import UserCardList from "../components/UserCardList.vue";

const onloading = ref(true)
let route = useRoute();
const {tags} = route.query
const userList = ref([])
onMounted(async () => {
    const userListData = await myAxios.get("/user/search/tags", {
        params: {
            tagNameList: tags
        },
        paramsSerializer: params => {
            return qs.stringify(params, {indices: false})
        }
    })
        .then(function (resp) {
            showSuccessToast("搜索成功")
            return resp.data?.data
        }).catch(function () {
            showFailToast("搜索失败")
        })
    onloading.value = false
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
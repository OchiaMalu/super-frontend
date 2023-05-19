<template>
    <template v-if="user">
        <van-cell title="头像" is-link to="user/edit">
            <img style="height: 48px" :src="user.avatarUrl">
        </van-cell>
        <van-cell title="昵称" to="user/edit" is-link :value="user.username"
                  @click="toEdit('username','昵称',user.username)"/>
        <van-cell title="用户账号" :value="user.userAccount"/>
        <van-cell title="性别" is-link to="user/edit" :value="user.gender"
                  @click="toEdit('gender','性别',user.gender)"/>
        <van-cell title="电话" is-link to="user/edit" :value="user.phone" @click="toEdit('phone','电话',user.phone)"/>
        <van-cell title="邮箱" is-link to="user/edit" :value="user.email" @click="toEdit('email','邮箱',user.email)"/>
        <!--        <van-cell title="注册时间" :value="user.createTime.toISOString()"/>-->
    </template>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import {getCurrentUser} from "../services/user.ts";

let router = useRouter();
const user = ref()
onMounted(async () => {
    let currentUser = await getCurrentUser();
    if (currentUser) {
        showSuccessToast("获取个人信息成功")
        user.value = currentUser
    } else {
        showFailToast("未登录")
        router.replace("/user/login")
    }
})
const toEdit = (editKey: string, editName: string, editValue: string) => {
    router.push({
        path: 'user/edit',
        query: {
            editKey,
            editName,
            editValue
        }
    })
}
</script>

<style scoped>

</style>
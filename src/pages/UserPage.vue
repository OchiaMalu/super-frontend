<template>
    <template v-if="user">
        <van-cell title="当前用户" :value="user?.username"/>
        <van-cell title="修改信息" is-link to="/user/update"/>
        <van-cell title="我创建的队伍" is-link to="/user/team/create"/>
        <van-cell title="我加入的队伍" is-link to="/user/team/join"/>
        <div style="margin: 16px;">
            <van-button style="margin-top: 10px" round block type="primary" native-type="submit" color="red"
                        @click="logout">
                退出
            </van-button>
        </div>
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
const logout = async () => {
    let res = await myAxios.post("/user/logout");
    if (res?.data.code === 0) {
        showSuccessToast("退出成功")
        await router.replace("/")
    } else {
        showFailToast("内部错误," + res?.data.message)
    }
}
</script>

<style scoped>

</style>
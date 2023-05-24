<template>
    <template v-if="user">
        <van-cell title="头像" is-link>
            <van-uploader v-model="fileList" :max-count="1" preview-size="60">
                <template #preview-delete/>
            </van-uploader>
        </van-cell>
        <van-cell title="用户账号" :value="user.userAccount"/>
        <van-cell title="昵称" is-link :value="user.username"
                  @click="toEdit('username','昵称',user.username)"/>
        <van-cell title="性别" is-link :value="user.gender"
                  @click="toEdit('gender','性别',user.gender)"/>
        <van-cell title="电话" is-link :value="user.phone" @click="toEdit('phone','电话',user.phone)"/>
        <van-cell title="邮箱" is-link :value="user.email" @click="toEdit('email','邮箱',user.email)"/>
    </template>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {showFailToast, showSuccessToast} from "vant";
import {getCurrentUser} from "../services/user.ts";

let router = useRouter();
const fileList = ref([
    {
        url: '',
        isImage: true
    }
]);
const user = ref()
onMounted(async () => {
    let currentUser = await getCurrentUser();
    if (currentUser) {
        showSuccessToast("获取个人信息成功")
        user.value = currentUser
        fileList.value[0].url = currentUser.avatarUrl
    } else {
        showFailToast("未登录")
        router.replace("/user/login")
    }
})
const toEdit = (editKey: string, editName: string, editValue: string) => {
    router.push({
        path: '/user/edit',
        query: {
            editKey,
            editName,
            editValue
        }
    })
}
</script>

<style scoped>
:deep(.van-uploader__upload) {
    border-radius: 50%;
}

:deep(.van-uploader__preview-image) {
    border-radius: 50%;
}
</style>
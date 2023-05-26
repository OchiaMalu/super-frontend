<template>
    <template v-if="user">
        <van-cell title="头像" is-link center >
            <van-uploader v-model="fileList" :max-count="1" :after-read="afterRead" preview-size="60px">
                <template #preview-delete/>
                <img :src="imgSrc" style="width: 60px;height: 60px;border-radius: 50%" alt=""/>
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
import myAxios from "../plugins/my-axios.js";

let router = useRouter();
const fileList = ref([]);
const user = ref()
const imgSrc = ref('')
onMounted(async () => {
    let currentUser = await getCurrentUser();
    if (currentUser) {
        showSuccessToast("获取个人信息成功")
        user.value = currentUser
        imgSrc.value = currentUser.avatarUrl
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
const afterRead = async () => {
    let formData = new FormData();
    formData.append("file", fileList.value[0].file)
    const res = await myAxios.post("/common/upload", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    if (res?.data.code === 0) {
        showSuccessToast("头像更新成功")
        imgSrc.value = res?.data.data
    } else {
        showFailToast("头像更新失败")
    }
    fileList.value = []
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
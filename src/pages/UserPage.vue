<template>
    <template v-if="user">
        <van-space style="margin: 20px">
            <van-image
                    round
                    width="80"
                    :src="user?.avatarUrl"
            />
            <van-cell :title="user.username" :label="user?.profile" />
        </van-space>
        <van-grid :border="false">
            <van-grid-item text="创建的队伍" to="/user/team/create" >
                <template #icon>
                    <van-icon class-prefix="my-icon" name="wochuangjiande" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="加入的队伍" to="/user/team/join" >
                <template #icon>
                    <van-icon class-prefix="my-icon" name="jiarubanji" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="我写的帖文" >
                <template #icon>
                    <van-icon class-prefix="my-icon" name="wofadetiezi" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="联系客服">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="fankui" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
        </van-grid>
        <van-cell title="修改信息" style="padding: 15px" is-link to="/user/update" :center="true">
            <template #icon>
                <van-icon name="user-circle-o" size="20" style="margin-right: 5px" color="#1989fa"/>
            </template>
        </van-cell>
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

:deep(.van-grid-item__text) {
    font-size: 8px;
}

</style>
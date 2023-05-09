<template>
    <van-cell title="昵称" to="user/edit" is-link :value="user.username" @click="toEdit('username','昵称',user.username)"/>
    <van-cell title="用户账号" :value="user.userAccount"/>
    <van-cell title="头像" is-link to="user/edit">
        <img style="height: 48px" :src="user.avatarUrl">
    </van-cell>
    <van-cell title="性别" is-link to="user/edit" :value="user.gender" @click="toEdit('gender','性别',user.gender)"/>
    <van-cell title="电话" is-link to="user/edit" :value="user.phone" @click="toEdit('phone','电话',user.phone)"/>
    <van-cell title="邮箱" is-link to="user/edit" :value="user.email" @click="toEdit('email','邮箱',user.email)"/>
    <van-cell title="注册时间" :value="user.createTime.toISOString()"/>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const user = {
    id: '1',
    username: '茶然o',
    userAccount: 'ochiamalu',
    avatarUrl: 'http://rtrx7n2j6.hd-bkt.clouddn.com/zhiyue.jpg',
    gender: '男',
    phone: '13738728682',
    email: 'linzhehao1108@126.com',
    status: '1',
    role: '1',
    tags: ['java', 'python'],
    createTime: new Date()
}
let router = useRouter();
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
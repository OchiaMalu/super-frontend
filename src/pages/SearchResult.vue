<template>
    <van-card v-for="user in userList"
              :desc="user.profile"
              :title="user.username"
              :thumb="user.avatarUrl"
    >
        <template #tags>
            <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px;margin-top: 8px">{{ tag }}
            </van-tag>
        </template>
        <template #footer>
            <van-button size="mini">联系我</van-button>
        </template>
    </van-card>
    <van-empty v-if="!userList ||　userList.length===0" image="search" description="暂无符合要求的用户"/>
</template>

<script setup>
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast, showToast} from "vant";
import qs from 'qs';

let route = useRoute();
const {tags} = route.query
// const mockUser = {
//     id: '1',
//     username: '茶然o',
//     userAccount: 'ochiamalu',
//     avatarUrl: 'http://rtrx7n2j6.hd-bkt.clouddn.com/zhiyue.jpg',
//     gender: '男',
//     profile: '目前还有头发，阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴阿巴',
//     phone: '13738728682',
//     email: 'linzhehao1108@126.com',
//     status: '1',
//     role: '1',
//     tags: ['java', 'python'],
//     createTime: new Date()
// }
// const userList = ref([mockUser])
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
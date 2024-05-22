<script setup lang="ts">
import { onMounted, ref } from "vue";
import myAxios from "../../plugins/my-axios";
import defaultImg from "../../../public/defalutTeamImg.jpg";
import { useRouter } from "vue-router";

let router = useRouter();
const userList = ref([]);
onMounted(async () => {
    let res = await myAxios.get("/chat/private");
    if (res?.data.code === 0) {
        userList.value = res.data.data;
    }
});
const toPrivateChat = (user) => {
    router.push({
        path: "/chat",
        query: {
            id: user.id,
            username: user.username,
            userType: 1,
        },
    });
};
</script>

<template>
    <van-cell-group v-for="user in userList">
        <van-cell @click="toPrivateChat(user)">
            <template #title>
                <span class="cell-span">{{ user.username }}</span>
            </template>
            <template #icon>
                <van-image :src="user.avatarUrl || defaultImg" round width="50" height="50"
                           style="margin-left: 10px" />
            </template>
        </van-cell>
    </van-cell-group>
    <van-empty
        v-if="!userList || userList.length===0"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        image-size="80"
        description="暂无私聊对象"
    />
</template>

<style scoped>

</style>

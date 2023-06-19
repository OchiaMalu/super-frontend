<template>
    <user-card-list :user-list="userList"/>
</template>

<script setup>
import UserCardList from "../components/UserCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";

const userList = ref()
onMounted(async () => {
    let res = await myAxios.get("/follow/my");
    if (res?.data.code === 0) {
        res.data.data.forEach((user) => {
            if (user.tags) {
                user.tags = JSON.parse(user.tags)
            }
        })
        userList.value = res.data.data
    }
})
</script>

<style scoped>

</style>

<template>
    <user-comment-list :comment-list="commentList"/>
</template>

<script setup>

import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import UserCommentList from "../components/UserCommentList.vue";

const commentList = ref()
onMounted(async () => {
    let res = await myAxios.get("/comments/list/my");
    if (res?.data.code === 0) {
        commentList.value = res.data.data
    }
})
</script>

<style scoped>

</style>

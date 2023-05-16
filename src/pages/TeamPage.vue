<template>
    <van-button type="primary" @click="doJoinTeam">加入队伍</van-button>
</template>

<script setup>
import {useRouter} from "vue-router";

let router = useRouter();
const doJoinTeam=()=>{
    router.push("/team/add")
}
</script>

<style scoped>

</style>
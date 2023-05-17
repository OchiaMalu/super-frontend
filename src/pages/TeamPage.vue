<template>
    <van-button type="primary" @click="doAddTeam">加入队伍</van-button>
    <TeamCardList :team-list="teamList"/>
</template>

<script setup>
import {useRouter} from "vue-router";
import TeamCardList from "../components/TeamCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";

let router = useRouter();
const doAddTeam=()=>{
    router.push("/team/add")
}
const teamList=ref([])
onMounted(async ()=>{
    const res=await myAxios.get("/team/list")
    if (res?.data.code===0){
        showSuccessToast("队伍加载成功")
        teamList.value=res.data.data
        console.log(res.data.data);
    }else {
        showFailToast("队伍加载失败，请稍后重试")
    }
})
</script>

<style scoped>

</style>
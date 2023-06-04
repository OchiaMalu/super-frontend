<template>
    <van-image
            width="100%"
            height="120"
            :src="defaultImg"
    />
    <van-cell-group inset>
        <van-cell title="队伍名" icon="location-o" :value="team.name"/>
        <van-cell title="队伍描述" icon="location-o" :value="team.description"/>
        <van-cell title="队长" icon="location-o" :value="team.leaderName"/>
        <van-cell title="队伍状态" icon="location-o" :value="teamStatusEnum[team.status]"/>
        <van-cell title="队伍人数" icon="location-o" :value="`${team.hasJoinNum}/${team.maxNum}`"/>
        <van-cell title="过期时间" icon="location-o" :value="team.expireTime || '永不过期'"/>
    </van-cell-group>
</template>

<script setup lang="ts">
import defaultImg from "../../public/defalutTeamImg.jpg"
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast} from "vant";
import {teamStatusEnum} from "../constants/team.ts";

let route = useRoute();
const team = ref({})
onMounted(async () => {
    let res = await myAxios.get("/team/" + route.query.id);
    if (res?.data.code === 0) {
        team.value = res.data.data
    } else {
        showFailToast("队伍查询失败")
    }
})
</script>

<style scoped>

</style>
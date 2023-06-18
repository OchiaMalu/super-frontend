<template>
    <van-image
        width="100%"
        height="120"
        :src="defaultImg"
    />
    <van-cell-group inset>
        <van-cell title="队伍名" icon="flag-o" :value="team.name"/>
        <van-cell title="队伍描述" icon="label-o" :value="team.description"/>
        <van-cell title="队长" icon="manager-o" :value="team.leaderName"/>
        <van-cell title="队伍状态" icon="shield-o" :value="teamStatusEnum[team.status]"/>
        <van-cell title="队伍人数" icon="friends-o" :value="`${team.hasJoinNum}/${team.maxNum}`"/>
        <van-cell title="过期时间" icon="clock-o" :value="team.expireTime || '永不过期'"/>
    </van-cell-group>
    <van-divider
        :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
    >
        队伍成员
    </van-divider>
    <user-card-list :user-list="teamMemberList"/>
</template>

<script setup lang="ts">
import defaultImg from "../../public/defalutTeamImg.jpg"
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast} from "vant";
import {teamStatusEnum} from "../constants/team.ts";
import UserCardList from "../components/UserCardList.vue";

const teamMemberList = ref()
let route = useRoute();
const team = ref({})
onMounted(async () => {
    let res = await myAxios.get("/team/" + route.query.id);
    if (res?.data.code === 0) {
        team.value = res.data.data
        let res_ = await myAxios.get("/team/member/" + route.query.id);
        if (res_.data.code === 0) {
            res_.data.data.forEach((user) => {
                if (user.tags) {
                    user.tags = JSON.parse(user.tags)
                }
            })
            teamMemberList.value = res_.data.data
        }
    } else {
        showFailToast("队伍查询失败")
    }
})
</script>

<style scoped>

</style>

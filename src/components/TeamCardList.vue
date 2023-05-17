<template>
    <van-card v-for="team in props.teamList"
              :desc="team.description"
              :title="team.name"
              :thumb="defaultImg"
    >
        <template #tags>
            <van-tag plain type="danger" style="margin-right: 8px;margin-top: 8px">{{ teamStatusEnum[team.status] }}
            </van-tag>
        </template>
        <template #bottom>
            <div style="margin-top: 20px">
                {{ '最大人数：' + team.maxNum }}
            </div>
            <div v-if="team.expireTime">
                {{ '过期时间：' + team.expireTime }}
            </div>
        </template>
        <template #footer>
            <van-button size="small" plain type="primary" @click="doJoinTeam(team.id)">加入队伍</van-button>
        </template>
    </van-card>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {teamStatusEnum} from "../constants/team.ts";
import defaultImg from "../assets/defalutTeamImg.jpg"
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";

interface TeamCardListProps {
    teamList: TeamType[]
}

const props = defineProps<TeamCardListProps>()
const doJoinTeam = async (id: number) => {
    const res = await myAxios.post("/team/join", {
        teamId: id
    })
    if (res?.data.code === 0) {
        showSuccessToast("加入队伍成功")
    } else {
        showFailToast("加入队伍失败" + (res.data.description ? `,${res.data.description}` : ''))
    }
}
</script>

<style scoped>
:deep(.van-image__img) {
    height: 128px;
    object-fit: unset;
}
</style>
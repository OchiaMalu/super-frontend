<template>
        <van-card
                :desc="team.description"
                :title="team.name"
                :thumb="defaultImg"
                v-for="team in props.teamList"
        >
            <template #tags>
                <van-tag plain type="danger" style="margin-right: 8px;margin-top: 8px">{{ teamStatusEnum[team.status] }}
                </van-tag>
            </template>
            <template #bottom>
                <div style="margin-top: 20px">
                    {{ '队伍人数：' + team.hasJoinNum + "/" + team.maxNum }}
                </div>
                <div v-if="team.expireTime">
                    {{ '过期时间：' + team.expireTime }}
                </div>
            </template>
            <template #footer>
                <van-button v-if="!team.hasJoin" size="small" plain type="primary" @click="doJoinTeam(team)">
                    加入队伍
                </van-button>
                <van-button v-if="team.userId===currentUser?.id" size="small" plain @click="doUpdateTeam(team.id)">
                    更新队伍
                </van-button>
                <van-button v-if="team.hasJoin && team.userId!==currentUser?.id" size="small" plain
                            @click="doQuitTeam(team.id)">
                    退出队伍
                </van-button>
                <van-button v-if="team.userId===currentUser?.id" size="small" plain type="danger"
                            @click="doDeleteTeam(team.id)">
                    解散队伍
                </van-button>
            </template>
        </van-card>
        <van-dialog v-model:show="showPasswordDialog" title="请输入密码" show-cancel-button
                    @confirm="joinTeam(joinTeamId,teamPassword)"
                    @cancel="doClear">
            <van-field v-model="teamPassword" placeholder="请输入密码"/>
        </van-dialog>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {teamStatusEnum} from "../constants/team.ts";
import defaultImg from "../assets/defalutTeamImg.jpg"
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import {getCurrentUser} from "../services/user.ts";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";


const showPasswordDialog = ref(false)
const teamPassword = ref('')
let currentUser = ref()
const joinTeamId = ref()
let emits = defineEmits(['refresh']);
interface TeamCardListProps {
    teamList: TeamType[]
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
})

onMounted(async () => {
    currentUser.value = await getCurrentUser()
})
const router = useRouter()

const joinTeam = async (teamId, password = '') => {
    const res = await myAxios.post("/team/join", {
        teamId,
        password
    })
    if (res?.data.code === 0) {
        showSuccessToast("加入队伍成功")
        onRefresh()
    } else {
        showFailToast("加入队伍失败" + (res.data.description ? `,${res.data.description}` : ''))
    }
    doClear()
}
const doJoinTeam = async (team: TeamType) => {
    joinTeamId.value = team.id
    if (team.status === 2) {
        showPasswordDialog.value = true
    } else {
        await joinTeam(team.id)
    }
}
const doUpdateTeam = (id: number) => {
    router.push({
        path: "/team/update",
        query: {
            id
        }
    })
}

const doQuitTeam = async (id: number) => {
    const res = await myAxios.post("/team/quit", {
        teamId: id
    })
    if (res?.data.code === 0) {
        showSuccessToast("退出队伍成功")
        onRefresh()
    } else {
        showFailToast("加入队伍失败" + (res.data.description ? `,${res.data.description}` : ''))
    }
}

const doDeleteTeam = async (id: number) => {
    const res = await myAxios.post("/team/delete", {
        id
    })
    if (res?.data.code === 0) {
        showSuccessToast("解散队伍成功")
        onRefresh()
    } else {
        showFailToast("加入队伍失败" + (res.data.description ? `,${res.data.description}` : ''))
    }
}

const onRefresh= ()=>{
    emits("refresh")
}
const doClear = () => {
    joinTeamId.value = ''
    teamPassword.value = ''
}
</script>

<style scoped>
:deep(.van-image__img) {
    height: 128px;
    object-fit: unset;
}
</style>
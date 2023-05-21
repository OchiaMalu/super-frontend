<template>
    <div id="teamPage">
        <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
        <van-tabs v-model:active="active" @change="tabChange">
            <van-tab title="公开" name="public"/>
            <van-tab title="加密" name="private"/>
        </van-tabs>
        <TeamCardList :team-list="teamList"/>
        <van-button class="add-button" icon="plus" type="primary" @click="toCreateTeam"></van-button>
        <van-empty image="search" v-if="!teamList || teamList.length===0" description="暂无符合要求的队伍"/>
    </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import TeamCardList from "../components/TeamCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";

const active = ref('public')
let router = useRouter();
const searchText = ref("")
const teamList = ref([])


const tabChange = (name) => {
    if (name === 'public') {
        listTeams(searchText.value, 0)
    } else {
        listTeams(searchText.value, 2)
    }
}
const toCreateTeam = () => {
    router.push("/team/add")
}
const listTeams = async (val = '', status = 0) => {
    const res = await myAxios.get("/team/list", {
        params: {
            searchText: val,
            status
        }
    })
    if (res?.data.code === 0) {
        showSuccessToast("队伍加载成功")
        teamList.value = res.data.data
    } else {
        showFailToast("队伍加载失败" + (res.data.description ? `,${res.data.description}` : ''))
    }
}
const onSearch = async (val) => {
    await listTeams(val)
}

onMounted(async () => {
    await listTeams();
})
</script>

<style scoped>
#teamPage {

}

</style>
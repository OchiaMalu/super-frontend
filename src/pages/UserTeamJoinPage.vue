<template>
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
    <TeamCardList :team-list="teamList"/>
    <van-empty v-if="teamList?.length<1" description="数据为空"/>
</template>

<script setup>
import {useRouter} from "vue-router";
import TeamCardList from "../components/TeamCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";

let router = useRouter();
const searchText = ref("")
const doAddTeam = () => {
    router.push("/team/add")
}
const teamList = ref([])

/**
 * 搜索队伍
 * @param val
 * @returns {Promise<void>}
 */
const onSearch = async (val) => {
    const res = await myAxios.get("/team/list", {
        params: {
            searchText: val
        }
    });
    if (res?.data.code === 0) {
        showSuccessToast("队伍搜索成功")
        teamList.value = res.data.data
        console.log(res.data.data);
    } else {
        showFailToast("队伍搜索失败，请稍后重试")
    }
}


onMounted(async () => {
    /**
     * 搜索所有队伍
     * @type {axios.AxiosResponse<any>}
     */
    const res = await myAxios.get("/team/list/my/join")
    if (res?.data.code === 0) {
        showSuccessToast("队伍加载成功")
        teamList.value = res.data.data
    } else {
        showFailToast("队伍加载失败，请稍后重试")
    }
})
</script>

<style scoped>

</style>
<template>
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
    <TeamCardList :team-list="teamList" :on-loading="onLoading"/>
    <van-empty v-if="teamList?.length<1" description="数据为空"/>
</template>

<script setup lang="ts">
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
const onLoading = ref(true)
/**
 * 搜索队伍
 * @param val
 * @returns {Promise<void>}
 */
const onSearch = async (val) => {
    onLoading.value = true
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
    onLoading.value = false
}


onMounted(async () => {
    onLoading.value = true
    const res = await myAxios.get("/team/list/my/join")
    if (res?.data.code === 0) {
        showSuccessToast("队伍加载成功")
        teamList.value = res.data.data
    } else {
        showFailToast("队伍加载失败，请稍后重试")
    }
    onLoading.value = false
})
</script>

<style scoped>

</style>
<template>
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" />
    <van-pull-refresh
        v-if="teamList&&teamList.length>0"
        v-model="refreshLoading"
        success-text="刷新成功"
        @refresh="onRefresh"
    >
        <van-list
            v-model:loading="listLoading"
            :finished="listFinished"
            offset="0"
            finished-text="没有更多了"
            @load="onLoad"
        >
            <template #loading>
                <van-skeleton>
                    <template #template>
                        <div :style="{ display: 'flex', width: '100%' }">
                            <van-skeleton-image />
                            <div :style="{ flex: 1, marginLeft: '16px' }">
                                <van-skeleton-paragraph row-width="60%" />
                                <van-skeleton-paragraph />
                                <van-skeleton-paragraph />
                                <van-skeleton-paragraph />
                            </div>
                        </div>
                    </template>
                </van-skeleton>
            </template>
            <TeamCardList :team-list="teamList" @refresh="onRefresh" />
        </van-list>
    </van-pull-refresh>
    <van-empty v-if="teamList?.length<1 && !listLoading" description="数据为空" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showFailToast } from "vant";
import myAxios from "../../plugins/my-axios";
import TeamCardList from "../../components/TeamCardList.vue";

interface Team {
    id: number;
    name: string;
    description: string;
    maxNum: number;
    hasJoinNum: number;
    status: number;
    // 根据实际团队对象添加其他属性
}

// 响应式状态定义
const router = useRouter();
const searchText = ref<string>("");
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const currentPage = ref<number>(0);
const teamList = ref<Team[]>([]);

// 导航方法
const doAddTeam = (): void => {
    router.push("/team/add");
};

// 获取团队列表
const listTeams = async (currentPage: number, val: string = ""): Promise<void> => {
    try {
        listLoading.value = true;
        const res = await myAxios.get("/team/list/my/join", {
            params: {
                currentPage,
                searchText: val,
            },
        });

        if (res?.data.code === 0) {
            if (res.data.data.records.length === 0) {
                listFinished.value = true;
                return;
            }
            res.data.data.records.forEach((team: Team) => teamList.value.push(team));
        } else {
            showFailToast("队伍加载失败，请稍后重试");
        }
    } catch (error) {
        console.error("Failed to fetch teams:", error);
        showFailToast("加载失败，请稍后重试");
    } finally {
        listLoading.value = false;
    }
};

// 搜索处理
const onSearch = async (val: string): Promise<void> => {
    teamList.value = [];
    currentPage.value = 1;
    await listTeams(currentPage.value, val);
};

// 加载更多
const onLoad = async (): Promise<void> => {
    currentPage.value++;
    await listTeams(currentPage.value);
};

// 刷新处理
const onRefresh = async (): Promise<void> => {
    try {
        teamList.value = [];
        listFinished.value = false;
        currentPage.value = 1;
        await listTeams(currentPage.value);
    } catch (error) {
        console.error("Failed to refresh teams:", error);
    } finally {
        refreshLoading.value = false;
    }
};

onMounted(() => {
    onRefresh();
});
</script>

<style scoped>

</style>

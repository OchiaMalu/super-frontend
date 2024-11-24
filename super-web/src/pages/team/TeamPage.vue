<template>
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch"/>
    <van-tabs v-model:active="active" @change="tabChange">
        <van-tab title="公开" name="public"/>
        <van-tab title="加密" name="private"/>
    </van-tabs>
    <van-pull-refresh
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
                            <van-skeleton-image/>
                            <div :style="{ flex: 1, marginLeft: '16px' }">
                                <van-skeleton-paragraph row-width="60%"/>
                                <van-skeleton-paragraph/>
                                <van-skeleton-paragraph/>
                                <van-skeleton-paragraph/>
                            </div>
                        </div>
                    </template>
                </van-skeleton>
            </template>
            <TeamCardList :team-list="teamList" @refresh="onRefresh"/>
        </van-list>
    </van-pull-refresh>
    <van-empty image="search" v-if="(!teamList || teamList.length===0) && !listLoading" description="暂无符合要求的队伍"/>
    <van-button class="add-button" icon="plus" type="primary" @click="toCreateTeam"></van-button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showFailToast } from "vant";
import myAxios from "../../plugins/my-axios";
import { getCurrentUser } from "../../services/user.ts";
import TeamCardList from "../../components/TeamCardList.vue";

interface Team {
  id: number;
  name: string;
  description: string;
  status: number;
  // 根据实际团队对象添加其他属性
}

// 响应式状态定义
const active = ref<string>('public');
const searchText = ref<string>("");
const teamList = ref<Team[]>([]);
const refreshLoading = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const currentPage = ref<number>(0);

const router = useRouter();

// Tab 切换处理
const tabChange = (name: string): void => {
  teamList.value = [];
  listFinished.value = false;
  currentPage.value = 1;
  
  if (name === 'public') {
    listTeams(currentPage.value, searchText.value, 0);
  } else {
    listTeams(currentPage.value, searchText.value, 2);
  }
};

// 创建团队
const toCreateTeam = async (): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      await showConfirmDialog({
        message: "该功能需要登陆后使用,是否登录",
        confirmButtonText: "去登录"
      });
      router.replace("/user/login");
    } else {
      await router.push("/team/add");
    }
  } catch {
    // 用户取消登录对话框
  }
};

// 获取团队列表
const listTeams = async (
  currentPage: number, 
  val: string = '', 
  status: number = 0
): Promise<void> => {
  try {
    listLoading.value = true;
    const res = await myAxios.get("/team/list", {
      params: {
        searchText: val,
        status,
        currentPage
      }
    });

    if (res?.data.code === 0) {
      if (res.data.data.records.length === 0) {
        listFinished.value = true;
        return;
      }
      res.data.data.records.forEach((team: Team) => teamList.value.push(team));
    } else {
      showFailToast(`队伍加载失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    showFailToast("加载失败，请稍后重试");
  } finally {
    listLoading.value = false;
  }
};

// 搜索处理
const onSearch = async (val: string): Promise<void> => {
  teamList.value = [];
  listFinished.value = false;
  currentPage.value = 1;
  
  if (active.value === 'public') {
    await listTeams(currentPage.value, searchText.value, 0);
  } else {
    await listTeams(currentPage.value, searchText.value, 2);
  }
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
    
    if (active.value === 'public') {
      await listTeams(currentPage.value, searchText.value);
    } else {
      await listTeams(currentPage.value, searchText.value, 2);
    }
  } catch (error) {
    console.error('Failed to refresh teams:', error);
  } finally {
    refreshLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.van-card) {
  margin: 10px;
  border-radius: 10px;
}
</style>

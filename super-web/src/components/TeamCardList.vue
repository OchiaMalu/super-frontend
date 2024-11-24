<template>
    <van-card
        v-for="team in props.teamList"
        :key="team.id"
        :desc="team.description"
        :thumb="team.coverImage || defaultImg"
        @click-thumb="getTeamDetail(team.id)"
    >
        <template #title>
            <div class="team-title" @click="getTeamDetail(team.id)">{{ team.name }}</div>
        </template>
        <template #tags>
            <van-tag plain type="danger" style="margin-right: 8px;margin-top: 8px" @click="getTeamDetail(team.id)">
                {{ teamStatusEnum[team.status] }}
            </van-tag>
            <van-tag v-if="team.hasJoinNum === team.maxNum" plain type="danger"
                     style="margin-right: 8px;margin-top: 8px"
                     @click="getTeamDetail(team.id)">
                已满
            </van-tag>
        </template>
        <template #bottom>
            <div class="row avatar-group">
                <div class="avatar" v-for="avatar in team.joinedUserAvatars" :key="avatar">
                    <img :src="avatar" alt="">
                </div>
                <div v-if="team.hasJoinNum > 3" class="avatar" style="background-color:#497BC8;">
                    <span>+{{ team.hasJoinNum - 3 }}</span>
                </div>
            </div>
            <div v-if="team.expireTime" style="margin-bottom: 10px">
                {{ "过期时间：" + team.expireTime }}
            </div>
        </template>
        <template #footer>
            <van-button v-if="!team.hasJoin" size="small" plain type="primary" @click="doJoinTeam(team)">
                加入队伍
            </van-button>
            <van-button v-if="team.hasJoin && team.userId !== currentUser?.id" size="small" plain
                        @click="doQuitTeam(team.id)">
                退出队伍
            </van-button>
            <van-button v-if="team.userId === currentUser?.id || currentUser?.role === 1" size="small" plain
                        @click="doUpdateTeam(team.id)">
                更新队伍
            </van-button>
            <van-button v-if="team.userId === currentUser?.id || currentUser?.role === 1" size="small" plain
                        type="danger"
                        @click="doDeleteTeam(team.id)">
                解散队伍
            </van-button>
        </template>
    </van-card>
    <van-dialog v-model:show="showPasswordDialog" title="请输入密码" show-cancel-button
                @confirm="joinTeam(joinTeamId!, teamPassword)"
                @cancel="doClear">
        <van-field v-model="teamPassword" placeholder="请输入密码" />
    </van-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { TeamType } from "../models/team";
import { teamStatusEnum } from "../constants/team";
import { getCurrentUser } from "../services/user";
import defaultImg from "../../public/defalutTeamImg.jpg";
import myAxios from "../plugins/my-axios";

interface Props {
    teamList: TeamType[];
}

interface User {
    id: number;
    role?: number;
}

// Props 定义
const props = defineProps<Props>();
const emits = defineEmits(["refresh"]);

// 响应式状态定义
const showPasswordDialog = ref<boolean>(false);
const teamPassword = ref<string>("");
const currentUser = ref<User | null>(null);
const joinTeamId = ref<number>();
const router = useRouter();

// 加入队伍
const joinTeam = async (teamId: number, password: string = ""): Promise<void> => {
    try {
        const res = await myAxios.post("/team/join", {
            teamId,
            password,
        });

        if (res?.data.code === 0) {
            showSuccessToast("加入队伍成功");
            onRefresh();
        } else {
            showFailToast(`加入队伍失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
        doClear();
    } catch (error) {
        console.error("Failed to join team:", error);
        showFailToast("加入失败，请稍后重试");
    }
};

// 处理加入队伍
const doJoinTeam = async (team: TeamType): Promise<void> => {
    joinTeamId.value = team.id;
    if (team.status === 2) {
        showPasswordDialog.value = true;
    } else {
        await joinTeam(team.id);
    }
};

// 更新队伍
const doUpdateTeam = (id: number): void => {
    router.push({
        path: "/team/update",
        query: { id },
    });
};

// 退出队伍
const doQuitTeam = async (id: number): Promise<void> => {
    try {
        const res = await myAxios.post("/team/quit", {
            teamId: id,
        });

        if (res?.data.code === 0) {
            showSuccessToast("退出队伍成功");
            onRefresh();
        } else {
            showFailToast(`退出队伍失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch (error) {
        console.error("Failed to quit team:", error);
        showFailToast("退出失败，请稍后重试");
    }
};

// 删除队伍
const doDeleteTeam = async (id: number): Promise<void> => {
    try {
        await showConfirmDialog({
            title: "确定要解散队伍吗",
            message: "此操作无法撤回",
        });

        const res = await myAxios.post("/team/delete", { id });
        if (res?.data.code === 0) {
            showSuccessToast("解散队伍成功");
            onRefresh();
        } else {
            showFailToast(`解散队伍失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch {
        // 用户取消操作
    }
};

// 刷新处理
const onRefresh = (): void => {
    emits("refresh");
};

// 清理状态
const doClear = (): void => {
    joinTeamId.value = undefined;
    teamPassword.value = "";
};

// 查看队伍详情
const getTeamDetail = (id: number): void => {
    router.push({
        path: "/team/detail",
        query: { id },
    });
};

// 生命周期钩子
onMounted(async () => {
    try {
        currentUser.value = await getCurrentUser();
    } catch (error) {
        console.error("Failed to get current user:", error);
    }
});
</script>

<style scoped>
:deep(.van-image__img) {
    height: 128px;
    object-fit: unset;
}

.team-title {
    color: rgb(50, 50, 51);
    display: -webkit-box;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "Segoe UI", Arial, Roboto, "PingFang SC", miui, "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
    font-size: 12px;
    font-weight: 600;
    height: 16px;
    line-height: 16px;
    max-height: 32px;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 247px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
}

:deep(.van-icon__image) {
    border-radius: 50%;
}

.row {
    display: flex;
    align-items: center;
    margin: 30px 0 10px 12px;
}

.avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    img {
        width: 100%;
        height: 100%;
        border-radius: 25px;
        object-fit: cover;
    }

    span {
        color: #fff;
        font-size: 0.5em;
    }
}

.avatar-group .avatar {
    border: 2px solid #fff;
    margin-left: calc(-0.8em);
    box-shadow: unset;
}
</style>

<template>
    <van-image
        width="100%"
        height="120"
        :src="team.coverImage || defaultImg"
    />
    <van-cell-group inset>
        <van-cell v-if="currentUser?.role === 1 || currentUser?.id === team.userId" title="修改封面" icon="brush-o">
            <template #value>
                <van-uploader :max-count="1" :after-read="upload" v-model="fileList" :preview-image="false">
                    <van-button v-if="!uploading" icon="plus" type="primary" size="small">上传图片</van-button>
                    <van-button v-else icon="plus" type="primary" size="small" uploading uploading-text="上传中...">上传图片</van-button>
                </van-uploader>
            </template>
        </van-cell>
        <van-cell title="队伍名" icon="flag-o" :value="team.name"/>
        <van-cell title="队伍描述" icon="label-o" :value="team.description"/>
        <van-cell title="队长" icon="manager-o" :value="team.leaderName"/>
        <van-cell title="队伍状态" icon="shield-o" :value="teamStatusEnum[team.status]"/>
        <van-cell title="队伍人数" icon="friends-o" :value="`${team.hasJoinNum}/${team.maxNum}`"/>
        <van-cell title="过期时间" icon="clock-o" :value="team.expireTime || '永不过期'"/>
        <van-cell v-if="team.hasJoin" title="队伍聊天室" icon="chat-o" is-link @click="toChat"/>
    </van-cell-group>
    <van-divider
        :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
    >
        队伍成员
    </van-divider>
    <team-member-card-list :login-user="currentUser" :user-list="teamMemberList" :team="team" @refresh="onRefresh"/>
    <van-empty
        v-if="!teamMemberList.length && !loading"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
        image-size="80"
        description="暂时还没有队员"
    />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showFailToast } from "vant";
import myAxios from "../../plugins/my-axios";
import { teamStatusEnum } from "../../constants/team";
import { getCurrentUser } from "../../services/user";
import defaultImg from "../../../public/defalutTeamImg.jpg";
import TeamMemberCardList from "../../components/TeamMemberCardList.vue";

interface TeamType {
  id: number;
  name: string;
  description: string;
  coverImage?: string;
  userId: number;
  leaderName: string;
  status: 0 | 1 | 2;
  hasJoinNum: number;
  maxNum: number;
  expireTime?: string;
  hasJoin: boolean;
  teamName?: string;
}

interface User {
  id: number;
  role: number;
  tags?: string;
  // 根据实际用户对象添加其他属性
}

interface FileItem {
  file: File;
}

// 响应式状态定义
const loading = ref<boolean>(true);
const fileList = ref<FileItem[]>([]);
const teamMemberList = ref<User[]>([]);
const uploading = ref<boolean>(false);
const team = ref<TeamType>({} as TeamType);
const currentUser = ref<User | null>(null);

const route = useRoute();
const router = useRouter();

// 聊天室导航
const toChat = (): void => {
  router.push({
    path: "/chat",
    query: {
      teamId: team.value.id,
      teamName: team.value.name,
      teamType: 2
    }
  });
};

// 文件上传处理
const upload = async (file: FileItem): Promise<void> => {
  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("id", team.value.id.toString());
    
    await myAxios.put("/team/cover", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    location.reload();
  } catch (error) {
    console.error('Failed to upload file:', error);
    showFailToast("上传失败，请稍后重试");
  } finally {
    uploading.value = false;
  }
};

// 刷新处理
const onRefresh = (): void => {
  location.reload();
};

// 生命周期钩子
onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser();
    const teamRes = await myAxios.get(`/team/${route.query.id}`);
    
    if (teamRes?.data.code === 0) {
      team.value = teamRes.data.data;
      
      const memberRes = await myAxios.get(`/team/member/${route.query.id}`);
      if (memberRes?.data.code === 0) {
        teamMemberList.value = memberRes.data.data.map((user: User) => {
          if (user.tags && typeof user.tags === 'string') {
            user.tags = JSON.parse(user.tags);
          }
          return user;
        });
      } else {
        showFailToast(`获取队伍成员失败${memberRes.data.description ? `,${memberRes.data.description}` : ''}`);
      }
    } else {
      showFailToast(`队伍查询失败${teamRes.data.description ? `,${teamRes.data.description}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to load team details:', error);
    showFailToast("加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 如果需要添加样式可以在这里添加 */
</style>

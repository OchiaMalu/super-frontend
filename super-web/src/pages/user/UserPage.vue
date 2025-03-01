<template>
    <template v-if="user">
        <van-space style="margin: 20px">
            <van-image
                round
                width="80"
                height="80"
                :src="user.avatarUrl"
                @click="toUserUpdatePage"
            />
            <van-cell :title="user.username" style="width: 120px">
                <template #label>
                    <van-text-ellipsis :content="user.profile || '点此编辑个性签名'" @click="toEditProfile"/>
                </template>
            </van-cell>
        </van-space>
        <van-cell center>
            <template #title>
                <span style="margin-left: 20px">我的标签</span>
            </template>
            <template #value>
                <van-tag v-for="tag in user.tags" plain type="danger" style="margin-right: 8px;margin-top: 8px">
                    {{ tag }}
                </van-tag>
            </template>
        </van-cell>
        <van-grid :border="false">
            <van-grid-item text="创建的队伍" to="/user/team/create">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="wochuangjiande" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="加入的队伍" to="/user/team/join">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="jiarubanji" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="我写的帖文" to="/user/blog">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="wofadetiezi" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
            <van-grid-item text="联系管理员" @click="customerService">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="fankui" size="23" style="margin-bottom: 8px"/>
                </template>
            </van-grid-item>
        </van-grid>
        <van-cell title="修改信息" style="padding: 15px" is-link to="/user/update" :center="true">
            <template #icon>
                <van-icon name="user-circle-o" size="20" style="margin-right: 5px" color="#1989fa"/>
            </template>
        </van-cell>
        <div style="margin: 16px;">
            <van-button style="margin-top: 10px" round block type="primary" native-type="submit" color="red"
                        @click="logout">
                退出
            </van-button>
        </div>
      <van-dialog v-model:show="showCustomerService" title="联系管理员">
            <van-image
                height="60vh"
                width="100%"
                src="../../public/customer-service.jpg"
            />
        </van-dialog>
    </template>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { showFailToast, showSuccessToast } from "vant";
import myAxios from "../../plugins/my-axios";
import { getCurrentUser } from "../../services/user";

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  profile?: string;
  tags?: string | string[];
}

// 响应式状态定义
const router = useRouter();
const user = ref<User | null>(null);
const showCustomerService = ref<boolean>(false);

// 导航方法
const toEdit = (editKey: string, editName: string, editValue: string): void => {
  router.push({
    path: 'user/edit',
    query: {
      editKey,
      editName,
      editValue
    }
  });
};

// 退出登录
const logout = async (): Promise<void> => {
  try {
    const res = await myAxios.post("/user/logout");
    if (res?.data.code === 0) {
      showSuccessToast("退出成功");
      await router.replace("/");
    } else {
      showFailToast(`内部错误,${res?.data.message}`);
    }
  } catch (error) {
    console.error('Failed to logout:', error);
    showFailToast("退出失败，请稍后重试");
  }
};

// 编辑个性签名
const toEditProfile = (): void => {
  if (!user.value) return;
  
  router.push({
    path: "/user/edit",
    query: {
      editKey: "profile",
      editName: "个性签名",
      editValue: user.value.profile
    }
  });
};

// 客服对话框
const customerService = (): void => {
  showCustomerService.value = true;
};

// 用户更新页面
const toUserUpdatePage = (): void => {
  router.push("/user/update");
};

// 生命周期钩子
onMounted(async () => {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      user.value = currentUser;
      if (typeof currentUser.tags === 'string') {
        user.value.tags = JSON.parse(currentUser.tags);
      }
    } else {
      showFailToast("未登录");
      await router.replace("/user/login");
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
    showFailToast("加载失败，请稍后重试");
  }
});
</script>

<style scoped>
:deep(.van-grid-item__text) {
  font-size: 12px;
}
</style>

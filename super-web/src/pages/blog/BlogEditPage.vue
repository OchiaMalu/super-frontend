<template>
    <van-sticky>
        <van-nav-bar
                title="添加博文"
                left-arrow
                @click-left="onClickLeft"
                @click-right="onClickRight"
        >
            <template #right>
                发布
            </template>
        </van-nav-bar>
    </van-sticky>
    <div style="padding: 15px">
        <van-uploader v-model="fileList" preview-size="100" multiple :max-count="5" :max-size="10 * 1024 * 1024"
                      @oversize="overSize" :preview-full-image="false">
            <template #default>
                <div class="updateArea">
                    <van-icon name="plus" class="updateIcon" size="20px"/>
                </div>
            </template>
        </van-uploader>
        <van-field v-model="title"
                   placeholder="填写标题"
                   :rules="[{ required: true, message: '请输入用户名' }]"/>
        <van-field
            v-model="content"
            rows="1"
            autosize
            type="textarea"
            placeholder="添加正文"
            :rules="[{ required: true, message: '请输入用户名' }]"
        />
    </div>
    <van-overlay :show="addingOverlay">
        <div class="wrapper">
            <van-loading vertical>
                <template #icon>
                    <van-icon name="star-o" size="30"/>
                </template>
                添加中...
            </van-loading>
        </div>
    </van-overlay>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { showFailToast, showSuccessToast } from "vant";
import { useRoute, useRouter } from "vue-router";
import { getCurrentUser } from "../../services/user";
import myAxios from "../../plugins/my-axios";

interface FileItem {
  url?: string;
  file?: File;
  isImage?: boolean;
}

interface User {
  id: number;
  username: string;
  // 根据实际用户对象添加其他属性
}

// 定义响应式变量，添加类型
const addingOverlay = ref<boolean>(false);
const fileList = ref<FileItem[]>([]);
const title = ref<string>("");
const content = ref<string>("");
const router = useRouter();
const route = useRoute();
const user = ref<User | null>(null);
const blogId = ref<string | null>(null);

// 处理导航事件
const onClickLeft = (): void => {
  router.push("/");
};

const onClickRight = async (): Promise<void> => {
  if (title.value === '') {
    showFailToast("请填写标题");
    return;
  }
  if (content.value === '') {
    showFailToast("请填写正文");
    return;
  }

  addingOverlay.value = true;
  try {
    const formData = new FormData();
    
    if (!blogId.value) {
      // 添加新博文
      fileList.value.forEach((item) => {
        if (item.file) {
          formData.append("images", item.file);
        }
      });
      formData.append("title", title.value);
      formData.append("content", content.value);

      const res = await myAxios.post("/blog/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res?.data.code === 0) {
        showSuccessToast("添加成功");
        await router.replace("/");
      } else {
        showFailToast(`添加失败${res.data.description ? `,${res.data.description}` : ''}`);
      }
    } else {
      // 更新博文
      formData.append("id", blogId.value);
      const imgStr: string[] = [];
      
      fileList.value.forEach((item) => {
        if (item.url) {
          imgStr.push(item.url);
        } else if (item.file) {
          formData.append("images", item.file);
        }
      });

      formData.append("imgStr", imgStr.join(","));
      formData.append("title", title.value);
      formData.append("content", content.value);

      const res = await myAxios.put("/blog/update", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res?.data.code === 0) {
        showSuccessToast("更新成功");
        await router.replace(`/blog?id=${blogId.value}`);
      } else {
        showFailToast(`更新失败${res.data.description ? `,${res.data.description}` : ''}`);
      }
    }
  } catch (error) {
    showFailToast("操作失败，请稍后重试");
  } finally {
    addingOverlay.value = false;
  }
};

const overSize = (): void => {
  showFailToast("单个图片不能超过10M");
};

// 生命周期钩子
onMounted(async () => {
  if (route.query.id) {
    blogId.value = route.query.id as string;
  }
  
  if (route.query.images) {
    const images = Array.isArray(route.query.images) 
      ? route.query.images 
      : [route.query.images];
      
    images.forEach((item) => {
      fileList.value.push({
        url: item as string,
        isImage: true
      });
    });
  }

  if (route.query.title) {
    title.value = route.query.title as string;
  }
  
  if (route.query.content) {
    content.value = route.query.content as string;
  }

  const currentUser = await getCurrentUser();
  if (currentUser) {
    user.value = currentUser;
  } else {
    showFailToast("未登录");
    await router.replace("/user/login");
  }
});
</script>

<style scoped>
.updateIcon {
    left: 40px;
    top: 40px;
}

.updateArea {
    width: 100px;
    height: 100px;
    background-color: #f7f8fa;
    color: #dcdddf;
}

.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>

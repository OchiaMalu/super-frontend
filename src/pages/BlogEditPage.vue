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
        <van-uploader v-model="fileList" preview-size="100" multiple :max-count="5" :max-size="5 * 1024 * 1024"
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
</template>

<script setup>
import {onMounted, ref} from "vue";
import {showFailToast, showSuccessToast} from "vant";
import {useRouter} from "vue-router";
import {getCurrentUser} from "../services/user.ts";
import myAxios from "../plugins/my-axios.js";

const fileList = ref([])
const title = ref("")
const content = ref("")
const router = useRouter()
const user = ref()
const onClickLeft = () => {
    router.push("/")
};
const onClickRight = async () => {
    if (title.value === '') {
        showFailToast("请填写标题")
    }
    if (content.value === '') {
        showFailToast("请填写正文")
    }
    let formData = new FormData();
    for (let i = 0; i < fileList.value.length; i++) {
        formData.append("images", fileList.value[i].file)
    }
    formData.append("title", title.value)
    formData.append("content", content.value)
    let res = await myAxios.post("/blog/add", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    if (res?.data.code === 0) {
        showSuccessToast("添加成功")
        await router.replace("/")
    }
};
const overSize = () => {
    showFailToast("单个图片不能超过5M")
}
onMounted(async () => {
    let currentUser = await getCurrentUser();
    if (currentUser) {
        user.value = currentUser
    } else {
        showFailToast("未登录")
        router.replace("/user/login")
    }
})
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
</style>
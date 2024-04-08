<script setup lang="ts">

import { ArrowRight } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import myAxios from "../../plugins/my-axios.ts";
import { UploadInstance, UploadProps } from "element-plus";

const noticeText = ref("");
const input = ref("");
const fileList = ref([]);
const imgs = ref([]);


onMounted(async () => {
    let res = await myAxios.get("/config/notice");
    if (res?.data.code === 0) {
        noticeText.value = res.data.data;
    }
    let res2 = await myAxios.get("/config/swiper");
    if (res2.data.code === 0) {
        let index = 1;
        res2.data.data.forEach((item) => {
            const temp = { "name": index, "url": item };
            fileList.value.push(temp);
            index = index + 1;
        });
    }
    fileList.value.forEach((item)=>{
        imgs.value.push(item.url)
    })
});
const updateNotice = async () => {
    let res = await myAxios.post("/config/notice", input.value, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (res?.data.code === 0) {
        location.reload();
    }
};
const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
    uploadRef.value!.submit()
}
const handleRemove: UploadProps['onRemove'] = async (file) => {
    await myAxios.post("/config/remove",file.url,{
        headers: {
            "Content-Type": "application/json",
        },
    });
}
</script>

<template>
    <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>配置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-tabs tab-position="left">
            <el-tab-pane label="通知栏">
                <el-row>
                    <span style="margin-right: 10px">目前通知:</span>
                    <span>{{ noticeText }}</span>
                </el-row>
                <el-row>
                    <span style="margin-right: 10px;line-height: 30px">修改通知:</span>
                    <el-input style="width: 300px;margin-right: 10px" v-model="input"
                              placeholder="请输入内容"></el-input>
                    <el-button type="primary" plain @click="updateNotice">提交</el-button>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="轮播图">
                <el-carousel :interval="4000" type="card" height="200px" trigger="click">
                    <el-carousel-item v-for="item in imgs" :key="item">
                        <img :src="item" height="300px" width="100%">
                    </el-carousel-item>
                </el-carousel>
                <el-divider></el-divider>
                <el-upload
                    ref="uploadRef"
                    v-model:file-list="fileList"
                    class="upload-demo"
                    action="http://localhost:8080/api/config/upload"
                    :on-remove="handleRemove"
                    :auto-upload="false"
                >
                    <template #trigger>
                        <el-button type="primary">select file</el-button>
                    </template>

                    <el-button class="ml-3" type="success" @click="submitUpload">
                        upload to server
                    </el-button>

                    <template #tip>
                        <div class="el-upload__tip">
                            jpg/png files with a size less than 500kb
                        </div>
                    </template>
                </el-upload>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<style scoped>
.el-row {
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
}

.el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
}
</style>

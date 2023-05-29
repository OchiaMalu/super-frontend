<template>
    <form action="/">
        <van-search
                v-model="searchText"
                placeholder="请输入要搜索的标签"
                @search="onSearch"
        />
        <div v-if="activeIds.length > 0">
            <van-divider content-position="left">已选择标签</van-divider>
            <van-row gutter="16" style="padding: 0 16px">
                <van-col v-for="tag in activeIds">
                    <van-tag closeable size="small" type="primary" @close="close(tag)">
                        {{ tag }}
                    </van-tag>
                </van-col>
            </van-row>
        </div>
        <van-divider content-position="left">选择标签</van-divider>
        <van-tree-select
                v-model:active-id="activeIds"
                v-model:main-active-index="activeIndex"
                :items="tagList"
        />
    </form>
    <div style="margin: 20px">
        <van-button block type="primary" @click="searchUser">搜索</van-button>
    </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {useRouter} from "vue-router";

let router = useRouter();
const originTagList = [
    {
        text: '性别',
        children: [
            {text: '男', id: '男'},
            {text: '女', id: '女'},
            {text: '保密', id: '保密'}
        ],
    },
    {
        text: '年级',
        children: [
            {text: '高一', id: '高一'},
            {text: '高二', id: '高二'},
            {text: '高三', id: '高三'},
            {text: '大一', id: '大一'},
            {text: '大二', id: '大二'},
            {text: '大三', id: '大三'},
            {text: '大四', id: '大四'},
            {text: '研究生', id: '研究生'},
            {text: '已工作', id: '已工作'},
        ],
    },
];
let tagList = ref(originTagList);
const searchText = ref('');
const onSearch = () => {
    tagList.value = originTagList.map(parentTag => {
        const tempChildren = [...parentTag.children];
        const tempParentTag = {...parentTag};
        tempParentTag.children = tempChildren.filter(item => item.text.includes(searchText.value))
        return tempParentTag;
    })
};
const activeIds = ref([]);
const activeIndex = ref(0);

const close = (tag) => {
    activeIds.value = activeIds.value.filter((item) => {
        return item !== tag;
    })
};
const searchUser = () => {
    router.push({
        path: '/search/userList',
        query: {
            tags: activeIds.value
        }
    })
}
</script>

<style scoped>
</style>
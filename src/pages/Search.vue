<template>
    <form action="/">
        <van-search
                v-model="searchText"
                show-action
                placeholder="请输入要搜索的标签"
                @search="onSearch"
                @cancel="onCancel"
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

<script setup>

import {ref} from "vue";
import {useRouter} from "vue-router";

let router = useRouter();
const originTagList = [
    {
        text: '性别',
        children: [
            {text: '男', id: '男'},
            {text: '女', id: '女'},
        ],
    },
    {
        text: '年级',
        children: [
            {text: '大一', id: '大一'},
            {text: '大二', id: '大二'},
            {text: '大三', id: '大三'},
        ],
    },
];
let tagList = ref(originTagList);
const searchText = ref('');
const onSearch = (val) => {
    tagList.value = originTagList.map(parentTag => {
        const tempChildren = [...parentTag.children];
        const tempParentTag = {...parentTag};
        tempParentTag.children = tempChildren.filter(item => item.text.includes(searchText.value))
        return tempParentTag;
    })
};
const onCancel = () => {
    // searchText.value = '';
    tagList.value = originTagList;
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
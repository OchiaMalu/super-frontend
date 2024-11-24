<template>
    <van-sticky>
        <van-nav-bar
                title="标签"
                @click-right="onClickRight"
        >
            <template #right>
                跳过
            </template>
        </van-nav-bar>
    </van-sticky>
    <form action="/">
        <van-search
                v-model="searchText"
                placeholder="请输入要搜索的标签"
                @search="onSearch"
        />
        <div v-if="activeIds.length > 0">
            <van-divider content-position="left">已选择标签</van-divider>
            <van-row style="padding: 16px">
                <van-col v-for="tag in activeIds" :key="tag">
                    <van-tag closeable size="medium" type="primary" @close="close(tag)" style="margin: 5px">
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
        <van-divider content-position="left">自定义标签</van-divider>
        <van-cell-group inset>
            <van-field v-model="userDefinedTag" placeholder="请输入标签" style="padding-right: 5px">
                <template #button>
                    <van-button size="small" type="primary" @click="addUserDefinedTag">添加</van-button>
                </template>
            </van-field>
        </van-cell-group>
    </form>
    <div style="margin: 20px">
        <van-button block type="primary" @click="updateTag">完成</van-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeSelectItem } from 'vant'

// 定义响应式状态
const searchText = ref('')
const activeIds = ref<string[]>([])
const activeIndex = ref(0)
const userDefinedTag = ref('')

// 标签列表数据
const tagList = ref<TreeSelectItem[]>([
  {
    text: '热门标签',
    children: [
      { text: '前端', id: 'frontend' },
      { text: '后端', id: 'backend' },
      { text: '设计', id: 'design' }
    ]
  },
  {
    text: '技术方向',
    children: [
      { text: 'Vue', id: 'vue' },
      { text: 'React', id: 'react' },
      { text: 'Node.js', id: 'nodejs' }
    ]
  }
])

// 方法定义
const onClickRight = () => {
  // 处理跳过逻辑
}

const onSearch = (value: string) => {
  // 处理搜索逻辑
  console.log('搜索:', value)
}

const close = (tag: string) => {
  activeIds.value = activeIds.value.filter(t => t !== tag)
}

const addUserDefinedTag = () => {
  if (!userDefinedTag.value) return
  if (!activeIds.value.includes(userDefinedTag.value)) {
    activeIds.value.push(userDefinedTag.value)
  }
  userDefinedTag.value = ''
}

const updateTag = () => {
  // 处理标签更新逻辑
  console.log('已选择的标签:', activeIds.value)
}
</script>

<style scoped>
</style>

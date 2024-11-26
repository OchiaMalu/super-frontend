<script setup lang="ts">

import { ArrowRight, Edit } from "@element-plus/icons-vue";
import { ref } from "vue";

const tableData = ref([
    {
        "avatarUrl": "https://ochiamalu.top/public/favicon.ico",
        "name": "公共聊天室",
        "type": "公共聊天室",
    },
]);
</script>

<template>
    <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>聊天管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-table :data="tableData" table-layout="fixed" border stripe>
            <el-table-column label="封面" width="80px" slot-scope="scope">
                <template #default="scope">
                    <el-avatar
                        :src="scope.row.avatarUrl"
                        style="width: 50px;height: 50px"
                    />
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型" />
            <el-table-column fixed="right" label="操作" width="120px" slot-scope="scope">
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="getUserInfo(scope.row.id)" />
                </template>
            </el-table-column>
        </el-table>
        <!--        <el-pagination-->
        <!--            v-model:current-page="currentPage"-->
        <!--            :page-size="pageSize"-->
        <!--            :background="true"-->
        <!--            layout="total, prev, pager, next"-->
        <!--            :total="total"-->
        <!--            @current-change="handleCurrentChange"-->
        <!--        />-->
    </el-card>
</template>

<style scoped>

</style>

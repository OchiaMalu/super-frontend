<script setup lang="ts">
import * as echarts from "echarts";
import type { EChartsType } from "echarts";
import { Calendar, CaretBottom, CaretTop, Warning } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import { dayjs } from "element-plus";
import { ElMessage } from "element-plus";
import myAxios from "../../plugins/my-axios";
import { weeklyUserOption, pieOption, lineOptions } from "./chart-config";

interface UserInfo {
    avatarUrl: string;
    username: string;
}

const avatarUrl = ref<string>("");
const username = ref<string>("");
const timeValue = ref(dayjs().add(1, "month").startOf("month"));

let pieChart: EChartsType | null = null;
let barChart: EChartsType | null = null;
let lineChart: EChartsType | null = null;

const initCharts = () => {
    const pieElement = document.getElementById("pie");
    const weeklyUserElement = document.getElementById("weeklyUser");
    const estimateUserElement = document.getElementById("estimateUser");

    if (pieElement && weeklyUserElement && estimateUserElement) {
        pieChart = echarts.init(pieElement);
        barChart = echarts.init(weeklyUserElement);
        lineChart = echarts.init(estimateUserElement);

        pieChart.setOption(pieOption);
        barChart.setOption(weeklyUserOption);
        lineChart.setOption(lineOptions);
    }
};

const fetchUserInfo = async () => {
    try {
        const res = await myAxios.get<{
            code: number
            description: string
            data: UserInfo
        }>("/user/admin/current");

        if (res.data.code !== 0) {
            ElMessage.error(res.data.description);
            sessionStorage.clear();
            return;
        }

        avatarUrl.value = res.data.data.avatarUrl;
        username.value = res.data.data.username;
    } catch (error) {
        ElMessage.error("获取用户信息失败");
    }
};

onMounted(async () => {
    await fetchUserInfo();
    initCharts();
});
</script>

<template>
    <el-card shadow="never">
        <el-row :gutter="20">
            <el-avatar
                :src="avatarUrl"
                style="width: 70px;height: 70px"
            />
            <span style="margin-left: 15px;line-height: 70px">早安，{{ username }}，祝你开心每一天!</span>
        </el-row>
    </el-card>
    <el-card shadow="never" style="margin-top: 20px">
        <el-row :gutter="20" justify="space-between">
            <el-col :span="6">
                <div class="statistic-card">
                    <el-statistic :value="98500">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                每日活跃用户
                                <el-tooltip
                                    effect="dark"
                                    content="一天内登录的用户数"
                                    placement="top"
                                >
                                    <el-icon style="margin-left: 4px" :size="12">
                                        <Warning />
                                    </el-icon>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-statistic>
                    <div class="statistic-footer">
                        <div class="footer-item">
                            <span>比昨天</span>
                            <span class="green">
              24%
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="statistic-card">
                    <el-statistic :value="693700">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                每月活跃用户
                                <el-tooltip
                                    effect="dark"
                                    content="一个月内登录的用户数"
                                    placement="top"
                                >
                                    <el-icon style="margin-left: 4px" :size="12">
                                        <Warning />
                                    </el-icon>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-statistic>
                    <div class="statistic-footer">
                        <div class="footer-item">
                            <span>月度环比</span>
                            <span class="red">
              12%
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="statistic-card" style="text-align: center">
                    <el-countdown format="DD [days] HH:mm:ss" :value="timeValue">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                <el-icon style="margin-right: 4px" :size="12">
                                    <Calendar />
                                </el-icon>
                                距离下个月
                            </div>
                        </template>
                    </el-countdown>
                    <div class="countdown-footer">{{ timeValue.format("YYYY-MM-DD") }}</div>
                </div>
            </el-col>
        </el-row>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="8">
            <el-card shadow="never">
                <div id="pie" style="width: 100%;height: 300px"></div>
            </el-card>
        </el-col>
        <el-col :span="16">
            <el-card shadow="never">
                <div id="weeklyUser" style="width: 100%;height: 300px"></div>
            </el-card>
        </el-col>
    </el-row>
    <el-card shadow="never" style="margin-top: 20px">
        <div id="estimateUser" style="width: 100%;height: 300px"></div>
    </el-card>
</template>

<style scoped>
.statistic-card {
    height: 100%;
    padding: 20px;
    border-radius: 4px;
    background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
}

.statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.statistic-footer .footer-item span:last-child {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
}

.green {
    color: var(--el-color-success);
}

.red {
    color: var(--el-color-error);
}

.countdown-footer {
    margin-top: 8px;
    text-align: center;
}
</style>

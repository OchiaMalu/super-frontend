<template>
    <van-notice-bar color="#1989fa" background="#ecf9ff" left-icon="info-o">
        若不设置过期时间则永久有效
    </van-notice-bar>
    <van-form @submit="onSubmit">
        <van-cell-group inset>
            <van-field
                v-model="updateTeamData.name"
                name="name"
                label="名称"
                placeholder="请输入队伍名称"
                :rules="[{ required: true, message: '请输入队伍名称' }]"
            />
            <van-field
                    v-model="updateTeamData.description"
                    rows="1"
                    autosize
                    label="描述"
                    type="textarea"
                    placeholder="请输入队伍描述"
            />
            <van-field
                    v-model="updateTeamData.expireTime"
                    is-link
                    readonly
                    name="calendar"
                    label="过期时间"
                    placeholder="点击选择过期时间"
                    @click="showCalendar = true"
            />
            <van-calendar v-model:show="showCalendar" @confirm="onConfirm"/>
            <van-field name="radio" label="状态">
                <template #input>
                    <van-radio-group v-model="updateTeamData.status" direction="horizontal">
                        <van-radio name="0">公开</van-radio>
                        <van-radio name="1">私有</van-radio>
                        <van-radio name="2">加密</van-radio>
                    </van-radio-group>
                </template>
            </van-field>
            <van-field
                    v-if="updateTeamData.status==='2'"
                    v-model="updateTeamData.password"
                    type="password"
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    :rules="[{ required: true, message: '请输入密码' }]"
            />
        </van-cell-group>
        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
                更新
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/my-axios";
import {showFailToast, showSuccessToast} from "vant";

interface TeamData {
  id: number;
  name: string;
  description: string;
  expireTime: string;
  maxNum: number;
  password: string;
  status: string;
}

// 响应式状态定义
const router = useRouter();
const route = useRoute();
const updateTeamData = ref<Partial<TeamData>>({});
const showCalendar = ref<boolean>(false);

// 日期确认处理
const onConfirm = (date: Date): void => {
  const month = date.getMonth() + 1;
  const formattedMonth = month < 10 ? `0${month}` : month.toString();
  const day = date.getDate();
  const formattedDay = day < 10 ? `0${day}` : day.toString();
  
  updateTeamData.value.expireTime = `${date.getFullYear()}-${formattedMonth}-${formattedDay}`;
  showCalendar.value = false;
};

// 表单提交处理
const onSubmit = async (): Promise<void> => {
  try {
    const postData = {
      ...updateTeamData.value,
      status: Number(updateTeamData.value.status),
    };

    const res = await myAxios.post("/team/update", postData);
    if (res?.data.code === 0) {
      showSuccessToast("更新成功");
      await router.replace("/team");
    } else {
      showFailToast(`更新失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to update team:', error);
    showFailToast("更新失败，请稍后重试");
  }
};

// 生命周期钩子
onMounted(async () => {
  try {
    const res = await myAxios.get(`/team/${route.query.id}`);
    if (res?.data.code === 0) {
      const teamData = res.data.data;
      teamData.status = String(teamData.status);
      updateTeamData.value = teamData;
    } else {
      showFailToast(`队伍查询失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to fetch team:', error);
    showFailToast("加载失败，请稍后重试");
  }
});
</script>

<style scoped>

</style>

<template>
    <van-form @submit="onSubmit">
        <van-field
                v-model="editUser.currentValue"
                :name="`${editUser.editKey}`"
                required
                :label="`新${editUser.editName}`"
                :placeholder="`请输入${editUser.editName}`"
                :rules="[{ required: true, message: `请填写${editUser.editName}` }]"
        >
            <template v-if="editUser.editKey==='phone'|| editUser.editKey==='email'" #button>
                <van-button v-if="editUser.editKey==='phone'" size="small" type="primary" @click="sendMessage">
                    <span v-if="!codeTime">发送验证码</span>
                    <span v-else>{{ codeTime }}秒</span>
                </van-button>

                <van-button v-else size="small" type="primary" @click="sendEmailMessage">
                    <span v-if="!codeTime">发送验证码</span>
                    <span v-else>{{ codeTime }}秒</span>
                </van-button>
            </template>
        </van-field>

        <van-field
                v-if="!lock"
                v-model="code"
                required
                label="验证码"
                placeholder="请输入验证码"
                :rules="[{ required: true, message: '请填写验证码' }]"
        />
        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
                确定
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import myAxios from "../../plugins/my-axios";
import {ref} from "vue";
import {showFailToast, showNotify, showSuccessToast} from "vant";
import {getCurrentUser} from "../../services/user.ts";

interface EditUser {
    editKey: string;
    editName: string;
    currentValue: string;
}

// 响应式状态定义
const codeTime = ref<number>(0);
const code = ref<string>('');
const router = useRouter();
const route = useRoute();
const lock = ref<boolean>(true);

const editUser = ref<EditUser>({
    editKey: route.query.editKey as string,
    editName: route.query.editName as string,
    currentValue: route.query.editValue as string
});

// 手机号正则验证
const reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

// 表单提交处理
const onSubmit = async (): Promise<void> => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) {
            showFailToast("用户未登录");
            return;
        }

        const response = await myAxios.put("/user/update", {
            id: currentUser.id,
            [editUser.value.editKey]: editUser.value.currentValue,
            code: code.value
        });

        if (response.data.code === 0) {
            showSuccessToast("修改成功");
            await router.replace("/user/update");
        } else {
            showFailToast(`修改失败${response.data.description ? `,${response.data.description}` : ''}`);
        }
    } catch (error) {
        console.error('Failed to update user:', error);
        showFailToast("修改失败，请稍后重试");
    }
};

// 发送短信验证码
const sendMessage = async (): Promise<void> => {
    const phone = editUser.value.currentValue;
    if (!phone) {
        showNotify({ message: '请先输入手机号' });
        return;
    }

    if (!reg_tel.test(phone)) {
        showNotify({ message: '手机号格式错误' });
        return;
    }

    const flag = countDown();
    if (flag) {
        try {
            const res = await myAxios.get(`/user/message/update/phone?phone=${phone}`);
            lock.value = false;
            
            if (res?.data.code === 0) {
                showSuccessToast("短信发送成功，15分钟内有效");
            } else {
                showFailToast(`短信发送失败${res?.data.description ? `,${res.data.description}` : ''}`);
            }
        } catch (error) {
            console.error('Failed to send SMS:', error);
            showFailToast("发送失败，请稍后重试");
        }
    }
};

// 发送邮件验证码
const sendEmailMessage = async (): Promise<void> => {
    const email = editUser.value.currentValue;
    if (!email) {
        showNotify({ message: '请先输入邮箱' });
        return;
    }

    const flag = countDown();
    if (flag) {
        try {
            const res = await myAxios.get(`/user/message/update/email?email=${email}`);
            lock.value = false;
            
            if (res?.data.code === 0) {
                showSuccessToast("邮件发送成功，15分钟内有效");
            } else {
                showFailToast(`邮件发送失败${res?.data.description ? `,${res.data.description}` : ''}`);
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            showFailToast("发送失败，请稍后重试");
        }
    }
};

// 倒计时处理
const countDown = (): boolean => {
    if (codeTime.value > 0) {
        showFailToast("不能重复获取");
        return false;
    }

    codeTime.value = 60;
    const timer = setInterval(() => {
        codeTime.value--;
        if (codeTime.value < 1) {
            clearInterval(timer);
            codeTime.value = 0;
        }
    }, 1000);
    
    return true;
};
</script>

<style scoped>

</style>

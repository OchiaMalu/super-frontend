<template>
    <van-row justify="center">
        <van-image
            width="343"
            src="../../public/super.jpg"
            style="background-position:center"
        />
    </van-row>
    <van-notice-bar v-if="notice" color="#1989fa" background="#ecf9ff" left-icon="info-o">
        {{ notice_text }}
    </van-notice-bar>
    <van-form @submit="onSubmit">
        <van-cell-group inset>
            <van-field
                v-model="phone"
                required
                label="手机号"
                placeholder="请输入手机号"
                :rules="[{ required: true, message: '请填写手机号' }]"
            >
                <template #button>
                    <van-button size="small" type="primary" @click="sendMessage">
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
            <van-field
                v-model="username"
                required
                label="用户名"
                placeholder="请输入用户名"
                :rules="[{ required: true, message: '请填写用户名' }]"
            />
            <van-field
                v-model="password"
                required
                type="password"
                label="密码"
                placeholder="请输入密码"
                :rules="[{ required: true, message: '请填写密码' }]"
            />
            <van-field
                v-model="confirmPassword"
                required
                type="password"
                label="确认密码"
                placeholder="请输入密码"
                :rules="[{ validator, message: '两次输入的密码不一致' }]"
            />
        </van-cell-group>
        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
                注册
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showFailToast, showNotify, showSuccessToast } from "vant";
import myAxios from "../plugins/my-axios";
import { useRouter } from "vue-router";
import "vant/es/notify/style";

interface MyAxiosResponse<T> {
    code: number;
    data: T;
    description?: string;
}

interface RegisterForm {
    phone: string;
    code: string;
    userAccount: string;
    userPassword: string;
    checkPassword: string;
}

const reg_tel = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
const reg_username = /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/;

const username = ref<string>("");
const password = ref<string>("");
const phone = ref<string>("");
const code = ref<string>("");
const confirmPassword = ref<string>("");
const codeTime = ref<number>(0);
const lock = ref<boolean>(true);
const notice = ref<boolean>(false);
const notice_text = ref<string>("");

const router = useRouter();

const validator = (): boolean => {
    return password.value === confirmPassword.value;
};

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

const sendMessage = async (): Promise<void> => {
    if (phone.value === "") {
        showNotify({ message: "请先输入手机号" });
        return;
    }

    if (!reg_tel.test(phone.value)) {
        showNotify({ message: "手机号格式错误" });
        return;
    }

    const flag = countDown();
    if (flag) {
        const res = await myAxios.get<MyAxiosResponse<string>>("/user/message", {
            params: { phone: phone.value },
        });

        if (res?.data.code === 0) {
            showSuccessToast("短信发送成功，15分钟内有效");
            lock.value = false;
        } else {
            showFailToast(`短信发送失败,${res?.data.description ?? ""}`);
        }
    }
};

const onSubmit = async (): Promise<void> => {
    if (phone.value === "") {
        showFailToast("请填写手机号");
        return;
    }
    if (code.value === "") {
        showFailToast("请发送验证码");
        return;
    }
    if (password.value === "" || confirmPassword.value === "") {
        showFailToast("请填写密码");
        return;
    }
    if (!reg_username.test(username.value)) {
        showFailToast("账号非法");
        notice.value = true;
        notice_text.value = "字母开头，允许5-16字节，允许字母数字下划线";
        username.value = "";
        return;
    }

    const formData: RegisterForm = {
        phone: phone.value,
        code: code.value,
        userAccount: username.value,
        userPassword: password.value,
        checkPassword: confirmPassword.value,
    };

    const res = await myAxios.post<MyAxiosResponse<string>>("/user/register", formData);

    if (res?.data.code === 0) {
        showSuccessToast("注册成功");
        localStorage.setItem("token", res.data.data);
        window.location.href = "/after";
    } else {
        showFailToast(`注册失败,${res?.data.description ?? ""}`);
    }
};
</script>

<style scoped>
</style>

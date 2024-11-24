<template>
    <van-sticky>
        <van-nav-bar
            title="修改密码"
            left-arrow
            @click-left="onClickLeft"
        >
        </van-nav-bar>
    </van-sticky>
    <van-row justify="center">
        <van-image
            width="343"
            src="../../public/super.jpg"
            style="background-position:center"
        />
    </van-row>
    <div v-if="one">
        <van-form @submit="onSubmit">
            <van-cell-group inset>
                <van-field
                    v-model="phone"
                    name="userAccount"
                    label="手机号"
                    placeholder="请输入绑定的手机号"
                    :rules="[{ required: true, message: '请输入绑定的手机号' }]"
                />
            </van-cell-group>
            <div style="margin: 30px 16px 16px;">
                <van-button style="margin-top: 10px" round block type="primary" native-type="submit">
                    确认
                </van-button>
            </div>
        </van-form>
    </div>
    <div v-if="two">
        <van-cell center>
            <template #title>
                <span style="font-size: 20px;font-weight: bold;margin-left: 16px">为{{ username }}修改密码</span>
            </template>
            <template #label>
                <span style="font-size: 15px;margin-left: 16px">{{ phone }}</span>
            </template>
        </van-cell>
        <van-password-input
            :value="code"
            :length="4"
            :mask="false"
            :focused="showKeyboard"
            @focus="showKeyboard = true"
        />
        <van-number-keyboard
            v-model="code"
            :show="showKeyboard"
            @blur="showKeyboard = false"
        />
        <div style="margin: 30px 16px 16px;">
            <van-button style="margin-top: 10px" round block type="primary" @click="checkCode">
                确认
            </van-button>
        </div>
    </div>
    <div v-if="three">
        <van-field
            v-model="password"
            required
            type="password"
            label="新密码"
            placeholder="请输入新密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />
        <van-field
            v-model="confirmPassword"
            required
            type="password"
            label="确认新密码"
            placeholder="请输入新密码"
            :rules="[{ validator, message: '两次输入的密码不一致' }]"
        />
        <div style="margin: 30px 16px 16px;">
            <van-button style="margin-top: 10px" round block type="primary" @click="confirmUpdate">
                确认
            </van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import myAxios from "../plugins/my-axios";
import { showFailToast, showSuccessToast } from "vant";

interface MyAxiosResponse<T> {
    code: number;
    data: T;
    description?: string;
}

interface FormData {
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
}

const one = ref<boolean>(true);
const two = ref<boolean>(false);
const three = ref<boolean>(false);
const confirmPassword = ref<string>('');
const password = ref<string>('');
const code = ref<string>('');
const showKeyboard = ref<boolean>(false);
const router = useRouter();
const phone = ref<string>('');
const username = ref<string>('');

const onClickLeft = (): void => {
    router.push("/");
};

const validator = (): boolean => {
    return password.value === confirmPassword.value;
};

const onSubmit = async (): Promise<void> => {
    const res = await myAxios.get<MyAxiosResponse<string>>("/user/forget", {
        params: { phone: phone.value }
    });

    if (res?.data.code === 0) {
        username.value = res.data.data;
        one.value = false;
        two.value = true;
    } else {
        showFailToast(`失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
};

const checkCode = async (): Promise<void> => {
    const res = await myAxios.get<MyAxiosResponse<boolean>>("/user/check", {
        params: {
            phone: phone.value,
            code: code.value
        }
    });

    if (res?.data.code === 0) {
        two.value = false;
        three.value = true;
    } else {
        showFailToast(`失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
};

const confirmUpdate = async (): Promise<void> => {
    const formData: FormData = {
        phone: phone.value,
        code: code.value,
        password: password.value,
        confirmPassword: confirmPassword.value
    };

    const res = await myAxios.put<MyAxiosResponse<boolean>>("/user/forget", formData);

    if (res?.data.code === 0) {
        showSuccessToast("修改成功");
        await router.replace("/user");
    } else {
        showFailToast(`失败${res.data.description ? `,${res.data.description}` : ''}`);
    }
};
</script>

<style scoped>

</style>

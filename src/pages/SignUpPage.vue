<template>
    <van-row justify="center">
        <van-image
                width="343"
                src="../../public/super.jpg"
                style="background-position:center"
        />
    </van-row>
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
                    <van-button size="small" type="primary">发送验证码</van-button>
                </template>
            </van-field>
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

<script setup>
import {ref} from "vue";

const username = ref('');
const password = ref('');
const phone = ref('');
const confirmPassword = ref('')
const validator = () => {
    return password.value === confirmPassword.value;
}
const onSubmit = (values) => {
    console.log('submit', values);
};
</script>

<style scoped>
</style>
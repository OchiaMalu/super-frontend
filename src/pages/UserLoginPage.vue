<template>
    <div id="login">
        <div id="img">
            <van-image
                    width="343"
                    src="../../public/super.jpg"
                    style="background-position:center"
            />
        </div>
        <van-form @submit="onSubmit">
            <van-cell-group inset>
                <van-field
                        v-model="userAccount"
                        name="userAccount"
                        label="账号"
                        placeholder="请输入账号"
                        :rules="[{ required: true, message: '请输入用户名' }]"
                />
                <van-field
                        v-model="password"
                        type="password"
                        name="password"
                        label="密码"
                        placeholder="请输入密码"
                        :rules="[{ required: true, message: '请输入密码' }]"
                />
            </van-cell-group>
            <div style="margin: 16px;">
                <van-button style="margin-top: 10px" round block type="primary" native-type="submit">
                    登录
                </van-button>
                <van-button style="margin-top: 10px" color="#FFA034" round block type="primary" native-type="submit">
                    注册
                </van-button>
            </div>
        </van-form>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {showFailToast, showSuccessToast} from "vant";
import {useRoute, useRouter} from "vue-router";

const userAccount = ref('');
const password = ref('');
let router = useRouter();
let route = useRoute();
const onSubmit = async () => {
    const response = await myAxios.post("/user/login", {
        "userAccount": userAccount.value,
        "userPassword": password.value
    })
    if (response.data.code === 0 && response.data.data) {
        showSuccessToast("登录成功")
        window.location.href = <string>route.query.redirectUrl ?? '/'
    } else {
        showFailToast("登录失败，请重试")
    }
};
onMounted(() => {
    let ele = document.getElementsByClassName("van-field")[0];
    let padding_left = window.getComputedStyle(ele).getPropertyValue("padding-left");
    let img = document.getElementById("img");
    img.style.paddingLeft = padding_left
})
</script>

<style scoped>

</style>
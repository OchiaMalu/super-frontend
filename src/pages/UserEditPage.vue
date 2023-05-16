<template>
    <van-form @submit="onSubmit">
        <van-field
                v-model="editUser.currentValue"
                :name="editUser.editKey"
                :label="editUser.editName"
                :placeholder="`请输入${editUser.editName}`"
                :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
                提交
            </van-button>
        </div>
    </van-form>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import myAxios from "../plugins/my-axios.js";
import {ref} from "vue";
import {showFailToast, showSuccessToast, showToast} from "vant";
import {getCurrentUser} from "../services/user.ts";
// import {removeLoginUser} from "../status/user.ts";
const router = useRouter();
const route = useRoute();
const editUser = ref({
    editKey: route.query.editKey,
    editName: route.query.editName,
    currentValue: route.query.editValue
})


const onSubmit = async () => {
    const currentUser = await getCurrentUser();
    let response = await myAxios.put("/user/update", {
        'id': currentUser.id,
        [editUser.value.editKey]: editUser.value.currentValue
    });
    if (response.data.code === 0) {
        showSuccessToast("修改成功")
        router.replace("/user");
        // removeLoginUser()
    }else {
        showFailToast(response.data.message)
    }
};
</script>

<style scoped>

</style>
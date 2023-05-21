<template>
    <van-sticky>
        <van-nav-bar
                :title="title"
                left-arrow
                @click-left="onClickLeft"
                @click-right="onClickRight"
        >
            <template #right>
                <van-icon name="search" size="18"/>
            </template>
        </van-nav-bar>
    </van-sticky>
    <div id="content">
        <router-view/>
    </div>
    <van-tabbar route @change="onChange">
        <van-tabbar-item to="/" icon="home-o" name="index">主页</van-tabbar-item>
        <van-tabbar-item to="/team" icon="search" name="team">队伍</van-tabbar-item>
        <van-tabbar-item to="/user" icon="friends-o" name="user">个人</van-tabbar-item>
    </van-tabbar>


</template>
<script setup>
import {showToast} from "vant";
import {useRouter} from "vue-router";
import routes from "../config/routes.ts";
import {ref} from "vue";

let router = useRouter();
const DEFAULT_TITLE = "速配SUPER"
const title = ref(DEFAULT_TITLE)
router.beforeEach((to, from) => {
    const toPath = to.path
    const route = routes.find((routes) => {
        return routes.path === toPath
    })
    document.title = "速配SUPER"
    title.value = route?.title ?? DEFAULT_TITLE
})
const onClickLeft = () => {
    router.back()
};
const onClickRight = () => {
    router.push("/search")
};
const onChange = (index) => showToast(`标签 ${index}`);
</script>

<style scoped>
#content {
    padding-bottom: 50px;
}
</style>
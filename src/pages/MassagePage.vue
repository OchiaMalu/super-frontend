<template>
    <van-grid>
        <van-grid-item icon="comment" icon-color="#767ffe" text="所有评论"/>
        <van-grid-item icon="good-job" icon-color="#639efc" text="赞"/>
        <van-grid-item icon="friends" icon-color="#a778fc" text="关注"/>
        <van-grid-item icon="photo-o" icon-color="#65cdf2" text="@我的"/>
    </van-grid>
    <van-divider/>

    <MessageList/>

</template>

<script setup>
import MessageList from "../components/MessageList.vue";
</script>

<style>

.van-divider {
    border-width: 2px;
    margin: 2px;
}

:root:root {
    --van-grid-item-text-font-size: 14px
}
</style>
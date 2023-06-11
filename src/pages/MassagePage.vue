<template>
    <message-default-grid/>
    <message-list/>
</template>

<script setup>
import MessageList from "../components/MessageList.vue";
import MessageDefaultGrid from "../components/MessageDefalutGrid.vue"
import {onMounted} from "vue";
import {showDialog} from "vant";

onMounted(() => {
    showDialog({
        title: '消息中心功能尚未实现',
        message: '生命远不止连轴转和忙到极限，人类的体验远比这辽阔、丰富得多。',
    }).then(() => {
        // on close
    });
})
</script>

<style>

.van-divider {
    margin: 2px;
}

:root:root {
    --van-grid-item-text-font-size: 14px
}
</style>

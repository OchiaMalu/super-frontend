<template>
    <van-grid :border="false">
        <van-grid-item icon="comment" icon-color="#767ffe" text="所有评论"/>
        <van-grid-item icon="good-job" icon-color="#639efc" text="赞"/>
        <van-grid-item icon="friends" icon-color="#a778fc" text="好友"/>
        <van-grid-item>
            <template #icon>
                <van-icon class-prefix="my-icon" name="aite" color="#65cdf2" size="28"/>
            </template>
            <template #text>
                <span style="margin-top: 8px;font-size: 14px">关注</span>
            </template>
        </van-grid-item>
    </van-grid>
    <van-divider/>
</template>

<script>

</script>

<style scoped>

</style>

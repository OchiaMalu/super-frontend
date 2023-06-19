<template>
    <message-default-grid/>
    <van-cell-group v-for="team in teamList">
        <van-cell :title="`${team.name}`+'聊天室'" :label="team.description" @click="toChatRoom(team.id,team.name)">
            <template #icon>
                <div class="icon_area">
                    <van-icon name="volume" color="#2a2e31" class="icon" size="20px"/>
                </div>
            </template>
        </van-cell>
    </van-cell-group>
</template>

<script setup>
import MessageDefaultGrid from "../components/MessageDefalutGrid.vue"
import {onMounted, ref} from "vue";
import myAxios from "../plugins/my-axios.js";
import {useRouter} from "vue-router";

const teamList = ref()
onMounted(async () => {
    let res = await myAxios.get("/team/list/my/join/all");
    if (res?.data.code === 0) {
        teamList.value = res.data.data
    }

})
let router = useRouter();
const toChatRoom = (id, name) => {
    router.push({
        path: "/chat",
        query: {
            teamId: id,
            teamName: name,
            teamType: 2
        }
    })
}
</script>

<style>
.icon_area {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #ededed;
    position: relative;
    margin-right: 5px;
    margin-left: 10px;
}

.van-cell {
    padding-left: 5px;
}

.icon {
    position: absolute;
    left: 14px;
    top: 14px
}

.van-divider {
    margin: 2px;
}

:root:root {
    --van-grid-item-text-font-size: 14px
}
</style>

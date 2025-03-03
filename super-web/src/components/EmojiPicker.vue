<template>
    <div class="picker-tabs">
        <div
            class="tab-item"
            :class="{ active: activeTab === 'emoji' }"
            @click="activeTab = 'emoji'"
        >
            <van-icon size="20px" name="smile-o" />
        </div>
        <div
            class="tab-item"
            :class="{ active: activeTab === 'custom' }"
            @click="activeTab = 'custom'"
        >
            <van-icon size="20px" name="like-o" />
        </div>
    </div>

    <div class="picker-content">
        <div v-show="activeTab === 'emoji'" class="emoji-list">
      <span
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji-item"
          @click="selectEmoji(emoji)"
      >
        {{ emoji }}
      </span>
        </div>

        <div v-show="activeTab === 'custom'" class="custom-sticker">
            <div class="custom-list">
                <div class="upload-btn" @click="triggerUpload">
                    <van-icon name="plus" size="36" color="#ddd" />
                    <input
                        type="file"
                        ref="fileInput"
                        accept="image/*"
                        style="display: none"
                        @change="handleImageUpload"
                    />
                </div>

                <div v-for="(sticker, index) in customStickers"
                     :key="index"
                     class="custom-item"
                     @click="selectCustomSticker(sticker)"
                     @touchstart="startLongPress(sticker)"
                     @touchend="cancelLongPress"
                     @touchmove="cancelLongPress">
                    <img :src="sticker" alt="sticker" />
                </div>
            </div>

            <div class="empty-tip" v-if="!customStickers.length">
                <p>点击"+"添加自定义表情</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import { showFailToast, showDialog } from "vant";
import myAxios from "../plugins/my-axios";

const activeTab = ref("emoji");
const fileInput = ref(null);
const customStickers = ref([]);
const longPressTimer = ref(null);
const longPressDuration = 500; // 长按触发时间为500毫秒

const emojis = [
    "😊", "😂", "🥰", "😍", "😘", "😎",
    "😋", "😇", "🤔", "🤗", "🤭", "🤫",
    "😴", "🥺", "😭", "😤", "😠", "😡",
    "👍", "👎", "👌", "🙏", "🤝", "👋",
];

const emit = defineEmits(["select", "selectImage"]);

const selectEmoji = (emoji) => {
    emit("select", emoji);
};

const triggerUpload = () => {
    fileInput.value.click();
};

const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
        showFailToast("请选择图片文件");
        return;
    }

    // 检查文件大小（限制为 2MB）
    if (file.size > 2 * 1024 * 1024) {
        showFailToast("图片大小不能超过 2MB");
        return;
    }


    const formData = new FormData();
    formData.append("file", file);

    // 上传图片到服务器
    let res = await myAxios.post("/common/upload/file", formData);
    if (res.data.data) {
        await myAxios.post("/emoticon/add?url=" + res.data.data);
    }

    await listEmoticon();
    // 清空文件输入框，允许重复选择同一文件
    event.target.value = "";
};

const selectCustomSticker = (sticker) => {
    emit("selectImage", sticker);
};

const listEmoticon = async () => {
    await myAxios.get("/emoticon").then((res) => {
        customStickers.value = res.data.data;
    });
};

const startLongPress = (sticker) => {
    longPressTimer.value = setTimeout(async () => {
        const result = await showDialog({
            title: "删除表情",
            message: "确定要删除这个表情吗？",
            showCancelButton: true,
        });

        if (result === "confirm") {
            await myAxios.post("/emoticon/delete?url=" + sticker);
            await listEmoticon();
        }
    }, longPressDuration);
};

const cancelLongPress = () => {
    if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
    }
};

onMounted(() => {
    listEmoticon();
});

// 组件卸载时清除定时器
onUnmounted(() => {
    cancelLongPress();
});
</script>

<style scoped>
.picker-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    padding: 0 12px;
    background: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.tab-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    cursor: pointer;
    color: #666;
    font-size: 14px;
    position: relative;
}

.tab-item.active {
    color: #007AFF;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #007AFF;
}

.picker-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: white;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    height: calc(100% - 45px);
}

.emoji-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 4px;
    padding: 4px;
}

.emoji-item {
    font-size: 22px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    transition: all 0.2s;
}

.emoji-item:hover {
    background: #f5f5f5;
    border-radius: 8px;
}

.custom-sticker {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.custom-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
    padding: 12px;
}

.upload-btn {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    border: 2px dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
}

.upload-btn:hover {
    border-color: #007AFF;
    color: #007AFF;
    background: rgba(0, 122, 255, 0.05);
}

.custom-item {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    user-select: none; /* 防止长按时出现系统菜单 */
    -webkit-touch-callout: none; /* 在iOS上禁用长按菜单 */
}

.custom-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.custom-item:hover {
    opacity: 0.8;
}

.empty-tip {
    text-align: center;
    color: #999;
    padding: 20px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.empty-tip p {
    font-size: 14px;
    margin: 0;
}
</style> 
<template>
    <van-sticky>
        <van-nav-bar
            title="正文"
            left-arrow
            @click-left="onClickLeft"
            @click-right="showBottom=true"
        >
            <template #right>
                <van-icon class-prefix="my-icon" name="qita" color="#39a9ed" />
            </template>
        </van-nav-bar>
    </van-sticky>
    <div v-if="images.length>0">
        <div style="width: 100%;height: 10px;background-color: black" />
        <van-swipe :autoplay="3000" lazy-render style="height: 200px">
            <van-swipe-item v-for="image in images" :key="image" class="swipe-item">
                <img :src="image" alt="" @click="previewImage(image)" class="swipe-img" />
            </van-swipe-item>
        </van-swipe>
        <div style="width: 100%;height: 10px;background-color: black" />
    </div>


    <van-cell-group inset>
        <van-cell :title="blog.title" title-style="font-size:18px" />
        <van-cell center style="padding-right: 6px">
            <template #title>
                <span @click="toAuthor(author?.id)">{{ author.username }}</span>
            </template>
            <template #icon>
                <van-image :src="author.avatarUrl" width="40" height="40" round style="margin-right: 10px"
                           @click="toAuthor(author?.id)" />
            </template>
            <template #right-icon>
                <div v-if="author.id !== currentUser.id">
                    <van-button v-if="author.isFollow" type="primary" size="small" color="#c1c1c1"
                                @click="followUser(author as Author)">已关注
                    </van-button>
                    <van-button v-else icon="plus" type="primary" size="small" @click="followUser(author as Author)">关注
                    </van-button>
                </div>
            </template>
        </van-cell>
        <van-cell>
            <template #title>
                <div v-if="processedSegments.length === 0">
                    {{ blog.content }}
                </div>
                <div v-else>
                    <template v-for="(segment, index) in processedSegments" :key="index">
                        <div v-if="segment.type === 'text'">{{ segment.content }}</div>
                        <van-card
                            v-else-if="segment.type === 'card' && segment.cardData"
                            :desc="segment.cardData.desc"
                            :title="segment.cardData.title"
                            :thumb="segment.cardData.thumb"
                            @click="toLinkedBlog(segment.cardData.id)"
                        />
                    </template>
                </div>
            </template>
        </van-cell>
    </van-cell-group>

    <van-divider />
    <van-cell-group inset>
        <!--        todo 排序-->
        <van-cell :title="`评论 ${blog.commentsNum}`" />
    </van-cell-group>
    <div class="line"></div>

    <div style="padding-bottom: 80px">
        <comment-list :comment-list="commentList" @refresh="refresh" />
    </div>


    <van-cell-group :border="false">
        <van-field v-model="comment" :autosize="{minHeight: 32}" type="textarea" rows="1" placeholder="评论"
                   :border="false"
                   style="position: fixed;bottom: 0;padding-left: 16px;border-top: 1px solid #C1C1C1;padding-right: 10px">
            <template #right-icon>
                <van-icon class-prefix="my-icon" name="shangchuan" size="30" color="#4387f6" @click="addComment" />
            </template>
            <template #button>
                <van-icon name="envelop-o" size="15" style="margin-right: 5px">
                    <span style="margin-left: 2px">{{ blog.commentsNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-if="!blog.isLike" size="15" @click="likeBlog(blog as Blog)">
                    <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                </van-icon>
                <van-icon name="good-job-o" v-else color="red" size="15" @click="likeBlog(blog as Blog)"
                          style="margin-right: 2px">
                    <span style="margin-left: 2px">{{ blog.likedNum }}</span>
                </van-icon>
            </template>
        </van-field>
    </van-cell-group>
    <van-popup
        v-if="blog.userId===currentUser.id || currentUser.role===1"
        v-model:show="showBottom"
        round
        position="bottom"
        :style="{ height: '88px' }"
    >
        <van-grid :border="false">
            <van-grid-item @click="copyUrl">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="lianjie" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">复制链接</span>
                </template>
            </van-grid-item>
            <van-grid-item @click="updateBlog">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="tianxie" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">编辑</span>
                </template>
            </van-grid-item>
            <van-grid-item @click="deleteBlog">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="shanchu" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">删除</span>
                </template>
            </van-grid-item>
            <van-grid-item @click="report">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="jubao" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">举报</span>
                </template>
            </van-grid-item>
        </van-grid>
    </van-popup>

    <van-popup
        v-else
        v-model:show="showBottom"
        round
        position="bottom"
        :style="{ height: '88px' }"
    >
        <van-grid :border="false" :column-num="2">
            <van-grid-item @click="copyUrl">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="lianjie" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">复制链接</span>
                </template>
            </van-grid-item>
            <van-grid-item @click="report">
                <template #icon>
                    <van-icon class-prefix="my-icon" name="jubao" size="24" />
                </template>
                <template #text>
                    <span class="grid-font">举报</span>
                </template>
            </van-grid-item>
        </van-grid>
    </van-popup>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showConfirmDialog, showFailToast, showImagePreview, showSuccessToast } from "vant";
import myAxios, { URL } from "../../plugins/my-axios";
import CommentList from "../../components/CommentList.vue";
import { getCurrentUser } from "../../services/user";
import { CommentType } from "../../types/comment";

interface Author {
    id: number;
    username: string;
    avatarUrl: string;
    isFollow: boolean;
}

interface Blog {
    id: number;
    title: string;
    content: string;
    userId: number;
    commentsNum: number;
    likedNum: number;
    isLike: boolean;
    images?: string;
    author?: Author;
}

interface User {
    id: number;
    role: number;
    // 根据实际用户对象添加其他属性
}

interface CardData {
    id: string;
    title: string;
    desc: string;
    thumb: string;
}

interface ContentSegment {
    type: "text" | "card";
    content?: string;
    cardData?: CardData;
}

// 响应式状态定义
const showBottom = ref<boolean>(false);
const comment = ref<string>("");
const images = ref<string[]>([]);
const blog = ref<Blog>({} as Blog);
const author = ref<Author>({} as Author);
const commentList = ref<CommentType[]>([]);
const currentUser = ref<User>({} as User);
const processedSegments = ref<ContentSegment[]>([]);

const router = useRouter();
const route = useRoute();

// 方法定义
const toAuthor = (id: number | undefined): void => {
    if (id === undefined) return;
    router.push({
        path: "/user/detail",
        query: { id: id.toString() },
    });
};

const onClickLeft = (): void => {
    router.push("/");
};

const listComments = async (): Promise<void> => {
    const id = route.query.id;
    const commentRes = await myAxios.get(`/comments?blogId=${id}`);
    if (commentRes?.data.code === 0) {
        commentList.value = commentRes.data.data;
    }
};

const likeBlog = async (blogData: Blog): Promise<void> => {
    if (!blogData.id) return;
    const res = await myAxios.put(`/blog/like/${blogData.id}`);
    if (res?.data.code === 0) {
        const res_ = await myAxios.get(`/blog/${blogData.id}`);
        if (res_?.data.code === 0) {
            blog.value.likedNum = res_.data.data.likedNum;
            blog.value.isLike = res_.data.data.isLike;
        }
    }
};

const addComment = async (): Promise<void> => {
    if (!comment.value) {
        showFailToast("请输入评论内容");
        return;
    }

    try {
        const res = await myAxios.post("/comments/add", {
            blogId: blog.value.id,
            content: comment.value,
        });

        if (res?.data.code === 0) {
            showSuccessToast("添加成功");
            await listComments();
            comment.value = "";

            const id = route.query.id;
            const newBlogRes = await myAxios.get(`/blog/${id}`);
            if (newBlogRes?.data.code === 0) {
                blog.value.commentsNum = newBlogRes.data.data.commentsNum;
            }
        } else {
            showFailToast(`添加失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch (error) {
        showFailToast("评论失败，请稍后重试");
    }
};

const copyUrl = (): void => {
    const textArea = document.createElement("textarea");
    document.body.appendChild(textArea);
    textArea.readOnly = true;
    textArea.style.opacity = "0";
    textArea.value = document.location.href;
    textArea.select();

    if (textArea.setSelectionRange) {
        textArea.setSelectionRange(0, textArea.value.length);
    }

    document.execCommand("copy");
    document.body.removeChild(textArea);

    showSuccessToast({
        message: "已复制到剪切板",
        className: "copyToast",
    });
    showBottom.value = false;
};

const report = (): void => {
    showFailToast("举报成功");
    showBottom.value = false;
};

const deleteBlog = async (): Promise<void> => {
    try {
        await showConfirmDialog({
            title: "确定要删除博文吗",
            message: "此操作无法撤回",
        });

        const res = await myAxios.delete(`/blog/${blog.value.id}`);
        if (res?.data.code === 0) {
            await router.replace("/");
            showSuccessToast("删除成功");
        } else {
            showFailToast(`删除失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch {
        showBottom.value = false;
    }
};

const updateBlog = (): void => {
    router.push({
        path: "/blog/edit",
        query: {
            id: blog.value.id,
            images: images.value,
            title: blog.value.title,
            content: blog.value.content,
        },
    });
};

const followUser = async (authorData: Author): Promise<void> => {
    if (!authorData.id) return;
    const res = await myAxios.post(`/follow/${authorData.id}`);
    if (res?.data.code === 0) {
        const res_ = await myAxios.get(`/user/${authorData.id}`);
        if (res_.data.code === 0) {
            author.value.isFollow = res_.data.data.isFollow;
        }
    }
};

const refresh = (): void => {
    location.reload();
};

const previewImage = (url: string) => {
    showImagePreview([url]);
};

const toLinkedBlog = (id: string): void => {
    router.push({
        path: "/blog",
        query: {
            id: id,
        },
    });
};

const parseContent = async (): Promise<void> => {
    if (!blog.value.content) {
        processedSegments.value = [];
        return;
    }

    // 使用当前域名构建正则表达式
    const host = window.location.host;
    // 构建正则表达式，使用动态域名，同时支持http和https
    const regexPattern = new RegExp(`\\s*(https?:\\/\\/${host.replace(/\./g, "\\.")}\/blog\\?id=(\\d+))\\s*`, "g");

    let content = blog.value.content;
    let contentArr: ContentSegment[] = [];
    let lastIndex = 0;
    let matches: { index: number; length: number; url: string; id: string }[] = [];

    // 找出所有匹配项
    let match;
    while ((match = regexPattern.exec(content)) !== null) {
        matches.push({
            index: match.index,
            length: match[0].length,
            url: match[1], // 实际链接，不包含前后空格
            id: match[2],
        });
    }

    // 如果没有找到匹配项，直接返回原文本
    if (matches.length === 0) {
        processedSegments.value = [{
            type: "text",
            content: content,
        }];
        return;
    }

    // 处理文本和链接
    for (const item of matches) {
        // 添加链接前的文本
        if (item.index > lastIndex) {
            contentArr.push({
                type: "text",
                content: content.substring(lastIndex, item.index),
            });
        }

        // 处理链接
        try {
            const res = await myAxios.get(`/blog/${item.id}`);
            if (res?.data.code === 0) {
                const linkedBlog = res.data.data;
                let thumb = "";

                // 获取第一张图片作为缩略图
                if (linkedBlog.images) {
                    const blogImages = linkedBlog.images.split(",");
                    if (blogImages.length > 0) {
                        thumb = blogImages[0];
                    }
                }

                // 添加卡片
                contentArr.push({
                    type: "card",
                    cardData: {
                        id: item.id,
                        title: linkedBlog.title || "无标题",
                        desc: linkedBlog.content ?
                            (linkedBlog.content.length > 20 ?
                                linkedBlog.content.substring(0, 20) + "..." :
                                linkedBlog.content) :
                            "正文",
                        thumb,
                    },
                });
            } else {
                // 如果获取失败，保留原链接文本
                contentArr.push({
                    type: "text",
                    content: item.url,
                });
            }
        } catch (error) {
            // 发生错误，保留原链接文本
            contentArr.push({
                type: "text",
                content: item.url,
            });
        }

        lastIndex = item.index + item.length;
    }

    // 添加最后一段文本
    if (lastIndex < content.length) {
        contentArr.push({
            type: "text",
            content: content.substring(lastIndex),
        });
    }

    // 更新处理后的内容片段
    processedSegments.value = contentArr;

    // 调试日志
    console.log("处理后的内容片段:", processedSegments.value);
};

// 加载博文数据的函数
const loadBlogData = async (blogId: string): Promise<void> => {
    try {
        const res = await myAxios.get(`/blog/${blogId}`);
        
        if (res?.data.code === 0) {
            blog.value = res.data.data;
            author.value = res.data.data.author;

            if (res.data.data.images) {
                images.value = res.data.data.images.split(",");
            } else {
                images.value = [];
            }

            await parseContent();
            await listComments();
        } else {
            showFailToast(`加载失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch (error) {
        showFailToast("加载博文失败，请稍后重试");
    }
};

// 生命周期钩子
onMounted(async () => {
    currentUser.value = await getCurrentUser();
    const id = route.query.id as string;
    if (id) {
        await loadBlogData(id);
    }
});

// 监听路由变化
watch(
    () => route.query.id,
    async (newId) => {
        if (newId) {
            // 清空之前的数据
            blog.value = {} as Blog;
            author.value = {} as Author;
            images.value = [];
            processedSegments.value = [];
            
            // 加载新数据
            await loadBlogData(newId as string);
            
            // 滚动到页面顶部
            window.scrollTo(0, 0);
        }
    }
);
</script>

<style scoped>
:deep(.van-field__value) {
    margin-right: 15px;
}

.line {
    width: 100%;
    height: 1px;
    background: #ededed;
    position: relative;
}

.line::after {
    position: absolute;
    top: 0;
    left: 0;
    content: " ";
    display: block;
    width: 10%;
    height: 100%;
    background-color: #39a9ed;
}

.grid-font {
    font-size: 13px;
    color: #949494;
    margin-top: 5px
}

.copyToast {
    width: 100px;
}

:deep(.van-card__thumb) {
    width: 44px !important;
    height: 44px !important;
}

:deep(.van-card) {
    height: 60px;
}

.swipe-item {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.swipe-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>

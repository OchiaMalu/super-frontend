<template>
    <van-notice-bar
        color="#1989fa"
        background="#ecf9ff"
        left-icon="volume-o"
        style="margin-bottom: 10px"
        :text="noticeText"
    />
    <div style="position: relative;height: 100%;width: 100%">
        <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white" lazy-render
                   style="width: 90%;height: 150px;margin: 0 auto">
            <van-swipe-item v-for="image in images" :key="image.url">
                <a :href="image.redirect">
                    <img :src="image.url" style="width: 100%;height: 150px" />
                </a>
            </van-swipe-item>
        </van-swipe>
        <van-tabs v-model:active="active" @change="tabsChange">
            <van-tab title="👑 匹配用户">
                <van-search v-model="userSearch" placeholder="请输入搜索关键词" shape="round"
                            @search="searchUser" />
                <van-pull-refresh
                    v-if="userList && userList.length > 0"
                    v-model="refreshLoading"
                    success-text="刷新成功"
                    @refresh="onRefresh">
                    <van-list
                        v-model:loading="listLoading"
                        :finished="listFinished"
                        offset="0"
                        @load="onLoad"
                        style="margin: 15px"
                    >
                        <template #finished>
                            <span v-if="!searching">没有更多了</span>
                        </template>
                        <UserCardList :user-list="userList" />
                    </van-list>
                    <van-back-top right="20px" bottom="60px" />
                </van-pull-refresh>
                <van-empty v-if="(!userList ||　userList.length===0) && !listLoading && !searching" image="search"
                           description="暂无用户" />
            </van-tab>
            <van-tab title="📚 热门博文">
                <van-search v-model="blogSearch" placeholder="请输入搜索关键词" shape="round"
                            @search="searchBlog" />
                <van-pull-refresh
                    v-if="blogList && blogList.length > 0"
                    v-model="refreshLoading"
                    success-text="刷新成功"
                    @refresh="blogRefresh">
                    <van-list
                        v-model:loading="listLoading"
                        :finished="blogListFinished"
                        offset="0"
                        @load="blogLoad"
                        style="margin: 15px"
                    >
                        <template #finished>
                            <span v-if="!searching">没有更多了</span>
                        </template>
                        <blog-card-list :blog-list="blogList" />
                    </van-list>
                    <van-back-top right="20px" bottom="60px" />
                </van-pull-refresh>
                <van-empty v-if="(!blogList || blogList.length===0) && !listLoading && !searching" image="search"
                           description="暂无博文" />
            </van-tab>
            <van-loading vertical v-if="searching">
                <template #icon>
                    <van-icon name="star-o" size="30" />
                </template>
                加载中...
            </van-loading>
        </van-tabs>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import myAxios from "../plugins/my-axios";
import { showFailToast } from "vant";
import UserCardList from "../components/UserCardList.vue";
import BlogCardList from "../components/BlogCardList.vue";
import type { UserType } from "../types/user";
import type { BlogType } from "../types/blog";

interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
}

interface MyAxiosResponse<T> {
    code: number;
    data: T;
    description?: string;
}

interface Images {
    url: string;
    redirect?: string;
}

const searching = ref<boolean>(false);
const listLoading = ref<boolean>(false);
const listFinished = ref<boolean>(false);
const userList = ref<UserType[]>([]);
const refreshLoading = ref<boolean>(false);
const currentPage = ref<number>(0);
const userSearch = ref<string>("");
const active = ref<number>(0);
const blogList = ref<BlogType[]>([]);
const blogListFinished = ref<boolean>(false);
const blogCurrentPage = ref<number>(0);
const noticeText = ref<string>("富强、民主、文明、和谐；自由、平等、公正、法治；爱国、敬业、诚信、友善。");

const images = ref<Images[]>([
    {
        url: "https://niu.ochiamalu.fun/Snipaste_2025-05-12_10-25-07.png",
        redirect: "https://prodocs.top/",
    },
    {
        url: "https://img0.baidu.com/it/u=3358848204,1936258606&fm=253&fmt=auto&app=120&f=JPEG?w=1421&h=800",
    },
    {
        url: "https://img2.baidu.com/it/u=3012806272,1276873993&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=500",
    },
    {
        url: "https://img0.baidu.com/it/u=741268616,1401664941&fm=253&fmt=auto&app=138&f=JPEG?w=748&h=500",
    },
    {
        url: "https://img1.baidu.com/it/u=2389614815,1145894179&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800",
    },
]);

onMounted(async () => {
    await getNotice();
    await getSwiper();
    await onRefresh();
    await blogRefresh();
    if (sessionStorage.getItem("tabIndex") === "1") {
        active.value = 1;
    }
});

const tabsChange = (index: number): void => {
    sessionStorage.setItem("tabIndex", index.toString());
};

const getNotice = async (): Promise<void> => {
    try {
        const res = await myAxios.get<MyAxiosResponse<string>>("/config/notice");
        if (res.data.data !== null) {
            noticeText.value = res.data.data;
        }
    } catch (error) {
        console.error("Failed to fetch notice:", error);
    }
};

const getSwiper = async (): Promise<void> => {
    try {
        const res = await myAxios.get<MyAxiosResponse<string[]>>("/config/swiper");
        if (res.data.data !== null) {
            images.value = res.data.data;
        }
    } catch (error) {
        console.error("Failed to fetch swiper:", error);
    }
};

const blogLoad = async (): Promise<void> => {
    blogCurrentPage.value++;
    await getBlogList(blogCurrentPage.value);
};

const getBlogList = async (currentPage: number): Promise<void> => {
    try {
        const res = await myAxios.get<MyAxiosResponse<PageResult<BlogType>>>("/blog/list", {
            params: {
                currentPage,
                title: blogSearch.value,
            },
        });

        if (res?.data.code === 0) {
            if (res.data.data.records.length > 0) {
                blogList.value.push(...res.data.data.records);
            } else {
                blogListFinished.value = true;
            }
            listLoading.value = false;
        }
    } catch (error) {
        console.error("Failed to fetch blog list:", error);
    }
};

const getUserList = async (currentPage: number): Promise<void> => {
    try {
        const res = await myAxios.get<MyAxiosResponse<PageResult<UserType>>>("/user/match", {
            params: {
                currentPage,
                username: userSearch.value,
            },
        });

        if (res?.data.code === 0) {
            const records = res.data.data.records;
            if (records.length === 0) {
                listFinished.value = true;
                return;
            }

            records.forEach((user: UserType) => {
                if (user.tags) {
                    user.tags = JSON.parse(user.tags as unknown as string);
                }
            });

            userList.value.push(...records);
        } else {
            showFailToast(`加载失败${res.data.description ? `,${res.data.description}` : ""}`);
        }
    } catch (error) {
        console.error("Failed to fetch user list:", error);
    }
};

const onLoad = async (): Promise<void> => {
    currentPage.value++;
    await getUserList(currentPage.value);
    listLoading.value = false;
};

const onRefresh = async (): Promise<void> => {
    try {
        currentPage.value = 1;
        userList.value = [];
        listFinished.value = false;
        await getUserList(currentPage.value);
    } catch (error) {
        console.error("Failed to refresh:", error);
    } finally {
        refreshLoading.value = false;
        listLoading.value = false;
    }
};

const blogRefresh = async (): Promise<void> => {
    try {
        blogCurrentPage.value = 1;
        blogList.value = [];
        blogListFinished.value = false;
        await getBlogList(blogCurrentPage.value);
    } catch (error) {
        console.error("Failed to refresh blogs:", error);
    } finally {
        refreshLoading.value = false;
        listLoading.value = false;
    }
};

const searchUser = async (): Promise<void> => {
    searching.value = true;
    userList.value = [];
    currentPage.value = 1;
    await getUserList(currentPage.value);
    searching.value = false;
};

const blogSearch = ref<string>("");

const searchBlog = async (): Promise<void> => {
    searching.value = true;
    blogList.value = [];
    blogCurrentPage.value = 1;
    await getBlogList(blogCurrentPage.value);
    searching.value = false;
};
</script>

<style scoped>
.my-swipe .van-swipe-item {
    color: #fff;
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #39a9ed;
}

.my-swipe {
    margin: 15px;
    border-radius: 3%;
}


</style>

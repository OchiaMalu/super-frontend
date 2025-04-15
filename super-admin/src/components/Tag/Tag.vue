<script setup lang="ts">
import { ArrowRight, Delete, Plus, Download, RefreshRight } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import myAxios from "../../plugins/my-axios.ts";

// 定义接口类型
interface TagItem {
    text: string;
    id: string;
}

interface TagCategory {
    id: string;
    text: string;
    children: TagItem[];
    hasChanges?: boolean; // 标记该分类是否有未保存的更改
}

// 状态定义
const tagCategories = ref<TagCategory[]>([]);
const originalTagCategories = ref<TagCategory[]>([]);
const categoryDialogVisible = ref(false);
const tagDialogVisible = ref(false);
const currentCategoryText = ref<string>("");
const categoryFormRef = ref<FormInstance>();
const tagFormRef = ref<FormInstance>();
const anyChanges = ref(false);

// 表单数据
const categoryForm = reactive({
    name: "",
});

const tagForm = reactive({
    name: "",
});

// 表单验证规则
const categoryFormRules = reactive<FormRules>({
    name: [
        { required: true, message: "请输入一级标题名称", trigger: "blur" },
        { min: 1, max: 20, message: "长度在 1 到 20 个字符", trigger: "blur" },
    ],
});

const tagFormRules = reactive<FormRules>({
    name: [
        { required: true, message: "请输入标签名称", trigger: "blur" },
        { min: 1, max: 15, message: "长度在 1 到 15 个字符", trigger: "blur" },
    ],
});

// 获取所有标签分类
const fetchTagCategories = async () => {
    try {
        const res = await myAxios.get("/tag");
        if (res.data.code === 0) {
            // 为每个分类添加hasChanges属性
            const categoriesWithChanges = res.data.data.map((category: TagCategory) => ({
                ...category,
                hasChanges: false,
            }));

            tagCategories.value = categoriesWithChanges;
            // 创建深拷贝作为原始数据
            originalTagCategories.value = JSON.parse(JSON.stringify(categoriesWithChanges));
            anyChanges.value = false;
        } else {
            ElMessage.error(res.data.description || "获取标签失败");
        }
    } catch (error) {
        ElMessage.error("获取标签分类失败");
    }
};

// 添加标签分类
const addCategory = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid: boolean) => {
        if (valid) {
            try {
                const res = await myAxios.post("/tag/add", {
                    text: categoryForm.name,
                });

                if (res.data.code === 0) {
                    ElMessage.success("添加标签分类成功");
                    categoryDialogVisible.value = false;
                    categoryForm.name = "";
                    // 刷新数据
                    await fetchTagCategories();
                } else {
                    ElMessage.error(res.data.description || "添加标签分类失败");
                }
            } catch (error) {
                ElMessage.error("添加标签分类失败");
            }
        }
    });
};

const addTag = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid: boolean) => {
        if (valid && currentCategoryText.value) {
            try {
                // 找到对应的分类
                const categoryIndex = tagCategories.value.findIndex(
                    category => category.text === currentCategoryText.value,
                );

                if (categoryIndex !== -1) {
                    // 添加标签到分类中
                    tagCategories.value[categoryIndex].children.push({
                        id: tagForm.name,
                        text: tagForm.name,
                    });

                    // 标记该分类有变更
                    tagCategories.value[categoryIndex].hasChanges = true;

                    tagDialogVisible.value = false;
                    tagForm.name = "";
                    anyChanges.value = true;
                }
            } catch (error) {
                ElMessage.error("添加标签失败");
            }
        }
    });
};

// 打开添加标签对话框
const openTagDialog = (categoryText: string) => {
    currentCategoryText.value = categoryText;
    tagDialogVisible.value = true;
};

const removeCategory = (id: string) => {
    ElMessageBox.confirm(
        "此操作将删除该标签分类及其下所有标签，是否继续？",
        "提示",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        },
    ).then(async () => {
        // 从本地数据中移除
        let res = await myAxios.post("/tag/delete", {
            id: id,
        });
        if (res.data.code === 0) {
            ElMessage.success("删除成功");
            await fetchTagCategories();
        } else {
            ElMessage.error(res.data.description);
        }
    }).catch(() => {
        // 用户取消删除，不执行任何操作
    });
};

const removeTag = (categoryText: string, tagId: string) => {
    ElMessageBox.confirm(
        "此操作将删除该标签，是否继续？",
        "提示",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        },
    ).then(() => {
        // 找到对应的分类
        const categoryIndex = tagCategories.value.findIndex(
            category => category.text === categoryText,
        );

        if (categoryIndex !== -1) {
            // 从分类中移除标签
            tagCategories.value[categoryIndex].children = tagCategories.value[categoryIndex].children.filter(
                tag => tag.id !== tagId,
            );

            // 标记该分类有变更
            tagCategories.value[categoryIndex].hasChanges = true;
            anyChanges.value = true;
        }
    }).catch(() => {
        // 用户取消删除，不执行任何操作
    });
};

// 保存单个分类的更改
const saveCategoryChanges = async (category: TagCategory) => {
    try {
        // 提取子标签的text数组
        const tagTexts = category.children.map(tag => tag.text);

        const res = await myAxios.post("/tag/update", {
            id: category.id,
            tags: tagTexts,
        });

        if (res.data.code === 0) {
            // 更新该分类的hasChanges状态
            const index = tagCategories.value.findIndex(c => c.id === category.id);
            if (index !== -1) {
                tagCategories.value[index].hasChanges = false;

                // 更新原始数据中的该分类
                const originalIndex = originalTagCategories.value.findIndex(c => c.id === category.id);
                if (originalIndex !== -1) {
                    originalTagCategories.value[originalIndex] = JSON.parse(JSON.stringify(tagCategories.value[index]));
                } else {
                    originalTagCategories.value.push(JSON.parse(JSON.stringify(tagCategories.value[index])));
                }
            }

            // 检查是否还有其他分类有未保存的更改
            anyChanges.value = tagCategories.value.some(c => c.hasChanges);

            ElMessage.success("保存成功");
        } else {
            ElMessage.error(res.data.description || "保存失败");
        }
    } catch (error) {
        ElMessage.error("保存失败");
    }
};

// 重新加载所有数据
const refreshAll = async () => {
    if (anyChanges.value) {
        ElMessageBox.confirm(
            "刷新将丢失所有未保存的更改，是否继续？",
            "提示",
            {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            },
        ).then(async () => {
            await fetchTagCategories();
            ElMessage.success("数据已刷新");
        }).catch(() => {
            // 用户取消操作
        });
    } else {
        await fetchTagCategories();
        ElMessage.success("数据已刷新");
    }
};

// 取消单个分类的更改
const cancelCategoryChanges = (category: TagCategory) => {
    const originalCategory = originalTagCategories.value.find(c => c.id === category.id);
    const index = tagCategories.value.findIndex(c => c.id === category.id);

    if (originalCategory && index !== -1) {
        // 如果在原始数据中找到该分类，则恢复其原始状态
        tagCategories.value[index] = JSON.parse(JSON.stringify(originalCategory));
        tagCategories.value[index].hasChanges = false;
    } else if (index !== -1) {
        // 如果是新添加的分类（原始数据中没有），则移除
        tagCategories.value.splice(index, 1);
    }

    // 检查是否还有其他分类有未保存的更改
    anyChanges.value = tagCategories.value.some(c => c.hasChanges);

    ElMessage.info("已取消更改");
};

onMounted(() => {
    fetchTagCategories();
});
</script>

<template>
    <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>标签管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="tag-card">
        <template #header>
            <div class="card-header">
                <span>标签管理</span>
                <div class="header-btns">
                    <el-button type="primary" @click="categoryDialogVisible = true">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加一级标题
                    </el-button>
                    <el-button type="info" @click="refreshAll">
                        <el-icon>
                            <RefreshRight />
                        </el-icon>
                        刷新数据
                    </el-button>
                </div>
            </div>
        </template>

        <div v-if="anyChanges" class="change-notice">
            <el-alert
                title="你有未保存的更改"
                type="warning"
                :closable="false"
                show-icon
            />
        </div>

        <div v-if="tagCategories.length === 0" class="empty-text">
            暂无标签分类，请添加
        </div>

        <el-collapse v-else accordion>
            <el-collapse-item
                v-for="category in tagCategories"
                :key="category.id"
                :title="category.text"
                :class="{ 'category-modified': category.hasChanges }"
            >
                <template #title>
                    <div class="category-title">
                        <div class="category-name">
                            <span>{{ category.text }}</span>
                            <el-tag v-if="category.hasChanges" type="warning" size="small" effect="plain"
                                    class="change-tag">已修改
                            </el-tag>
                        </div>
                        <div class="category-actions">
                            <el-button type="primary" size="small" @click.stop="openTagDialog(category.text)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                添加标签
                            </el-button>
                            <el-button
                                v-if="category.hasChanges"
                                type="success"
                                size="small"
                                @click="saveCategoryChanges(category)"
                            >
                                <el-icon>
                                    <Download />
                                </el-icon>
                                保存更改
                            </el-button>
                            <el-button
                                v-if="category.hasChanges"
                                type="info"
                                size="small"
                                @click="cancelCategoryChanges(category)"
                            >
                                取消更改
                            </el-button>
                            <el-button type="danger" size="small" @click.stop="removeCategory(category.id)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                                删除
                            </el-button>
                        </div>
                    </div>
                </template>

                <div class="tag-list">
                    <el-empty :image-size="100" v-if="!category.children || category.children.length === 0" description="暂无标签" style="margin: 0 auto" />
                    <el-tag
                        v-for="tag in category.children"
                        :key="tag.id"
                        class="tag-item"
                        closable
                        @close="removeTag(category.text, tag.id)"
                    >
                        {{ tag.text }}
                    </el-tag>
                </div>

                <!-- 保存和取消按钮，只在有变更时显示 -->

            </el-collapse-item>
        </el-collapse>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="添加标签分类" width="30%">
        <el-form
            ref="categoryFormRef"
            :model="categoryForm"
            :rules="categoryFormRules"
            label-width="100px"
        >
            <el-form-item label="分类名称" prop="name">
                <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="categoryDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addCategory(categoryFormRef)">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 添加标签对话框 -->
    <el-dialog v-model="tagDialogVisible" title="添加标签" width="30%">
        <el-form
            ref="tagFormRef"
            :model="tagForm"
            :rules="tagFormRules"
            label-width="100px"
        >
            <el-form-item label="标签名称" prop="name">
                <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="tagDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addTag(tagFormRef)">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<style scoped>
.tag-card {
    margin-top: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-btns {
    display: flex;
    gap: 10px;
}

.change-notice {
    margin-bottom: 15px;
}

.empty-text {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    padding: 30px 0;
    font-size: 14px;
}

.category-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.category-name {
    display: flex;
    align-items: center;
    gap: 10px;
}

.change-tag {
    margin-left: 5px;
}

.category-actions {
    display: flex;
    gap: 10px;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
}

.tag-item {
    margin-right: 10px;
    margin-bottom: 10px;
}

.category-modified {
    background-color: #fdf6ec;
}
</style>
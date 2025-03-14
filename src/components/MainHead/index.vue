<script setup>
import { onMounted, ref } from 'vue'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

defineProps({
    namespace: { type: Boolean, default: false },
    en: { type: Boolean, default: false },
    repo: { type: Boolean, default: false },
    urlEnv: { type: Boolean, default: false },
    searchDescribe: { type: String, default: '' },
    add: { type: Boolean, default: false }
})

const emit = defineEmits([
    'searchChange',
    'namespaceChange',
    // 'namespaceList',
    'envChange',
    'groupChange',
    'urlEnvChange',
    'dataList',
    'addFunc'
])

// 搜索
const searchValue = ref('')

function searchChange() {
    emit('searchChange', searchValue.value)
}

// 命名空间列表
const namespaceValue = ref('')

function nsChange() {
    serviceStore.setNameSpace(namespaceValue.value)
    // 子传父
    emit('namespaceChange', namespaceValue.value)
    // 重新获取一次资源列表
    emit('dataList')
}

onMounted(() => {
    //重新获取一次资源列表
    namespaceValue.value = serviceStore.service.namespace
    nsChange()
})
</script>

<template>
    <div>
        <a-card :body-style="{ padding: '10px' }">
            <a-row>
                <a-col :span="20">
                    <div style="text-align: left">
                        <!-- 选择框 -->
                        <!--  K8S集群环境选择框：当收到父组件传过来的namespace属性为true时,才展示这个选择框 -->
                        <span v-if="namespace" style="font-size: 14px">命名空间：</span>
                        <a-select
                            v-if="namespace"
                            v-model:value="namespaceValue"
                            placeholder="请选择"
                            show-search
                            size="small"
                            style="width: 140px; margin-right: 20px"
                            @change="nsChange"
                        >
                            <a-select-option
                                v-for="(item, index) in serviceStore.service.namespaceList"
                                :key="index"
                                :value="item.metadata.name"
                            >
                                {{ item.metadata.name }}
                            </a-select-option>
                        </a-select>
                        <!-- 搜索框 -->
                        <a-input
                            v-model:value="searchValue"
                            allow-clear
                            placeholder="请输入"
                            size="small"
                            style="width: 200px; margin-right: 10px"
                            @change="searchChange"
                        ></a-input>
                        <a-button ghost size="small" type="primary" @click="$emit('dataList')">
                            <template #icon>
                                <SearchOutlined />
                            </template>
                            搜索
                        </a-button>
                    </div>
                </a-col>
                <a-col :span="4">
                    <div style="text-align: right">
                        <a-button
                            v-if="add"
                            ghost
                            size="small"
                            style="margin-right: 10px"
                            type="primary"
                            @click="$emit('addFunc')"
                        >
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            新增
                        </a-button>
                        <a-button ghost size="small" @click="$emit('dataList')">
                            <template #icon>
                                <UndoOutlined />
                            </template>
                            刷新
                        </a-button>
                    </div>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<style lang="less" scoped>
.ant-btn {
    border-radius: 1px;
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { apiGetPodContainer, apiGetPodLog } from '@/api/kube/kube.js'

const appLoading = ref(false)
const router = useRouter()
// 容器列表
const containerValue = ref()
const containerList = ref([])

// 容器日志
const logContent = ref()

// 获取容器列表
async function getContainerList() {
    let query = router.currentRoute.value.query
    let params = {
        pod_name: query.pod_name,
        namespace: query.namespace,
        cluster: query.cluster
    }
    const res = await apiGetPodContainer(params)
    containerList.value = res.data
    containerValue.value = res.data[0]
    getContainerLog()
}

// 日志
async function getContainerLog() {
    appLoading.value = true
    let query = router.currentRoute.value.query
    let params = {
        container_name: containerValue.value,
        pod_name: query.pod_name,
        namespace: query.namespace,
        cluster: query.cluster
    }

    const res = await apiGetPodLog(params)
    logContent.value = res.data
    message.success(res.msg)
    appLoading.value = false
}

//生命周期钩子
onMounted(() => {
    getContainerList()
})
</script>

<template>
    <div>
        <div style="height: 10px"></div>
        <a-card :bodyStyle="{ padding: '10px', height: '45px' }">
            <span style="font-size: 14px">容器：</span>
            <a-select
                v-model:value="containerValue"
                placeholder="请选择"
                size="small"
                style="width: 140px"
                @change="getContainerLog()"
            >
                <a-select-option v-for="(item, index) in containerList" :key="index" :value="item">
                    {{ item }}
                </a-select-option>
            </a-select>
            <a-button ghost size="small" style="margin-left: 20px" type="primary" @click="getContainerLog()">
                <template #icon>
                    <UndoOutlined />
                </template>
                刷新
            </a-button>
        </a-card>
        <a-card :bodyStyle="{ padding: '10px' }" :loading="appLoading" class="log-card">
            {{ logContent }}
        </a-card>
    </div>
</template>

<style scoped>
.log-card {
    margin-top: 10px;
    height: calc(100vh - 67px);
    white-space: pre-wrap;
    overflow-y: auto;
}

.log-card::-webkit-scrollbar {
    width: 10px;
}

.log-card::-webkit-scrollbar-thumb {
    background-color: #666;
}

.log-card::-webkit-scrollbar-track {
    background-color: rgb(164, 162, 162);
}
</style>

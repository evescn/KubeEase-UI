<template>
    <div>
        <!-- 平台信息 -->
        <div style="float: left">
            <img :src="kubeLogo" style="height: 40px; margin-bottom: 10px" />
            <span style="font-size: 25px; padding: 0 50px 0 20px; font-weight: bold; color: #fff"> KubeEase </span>
        </div>
        <!-- 集群信息 -->
        <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" style="float: left; width: 250px; line-height: 64px" theme="dark">
            <a-menu-item v-for="item in serviceStore.service.clusterList" :key="item" @click="clusterChange(item)">
                {{ item }}
            </a-menu-item>
        </a-menu>
    </div>
</template>

<script setup>
import kubeLogo from '@/assets/k8s-metrics.png'
import { useServiceStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const serviceStore = useServiceStore()
const router = useRouter()
const selectedKeys = ref([])

// 处理集群变更
function clusterChange(val) {
    if (selectedKeys.value[0] !== val) {
        // 处理集群切换
        selectedKeys.value[0] = val
        // 设置 serviceStore 信息
        serviceStore.setK8sCluster(val)
        serviceStore.getNameSpaceInfo()
        // 刷新当前页面,目的是为了刷新数据
        location.replace(router.currentRoute.value.fullPath)
    }
}

onMounted(() => {
    selectedKeys.value[0] = serviceStore.service.k8s_cluster
})
</script>

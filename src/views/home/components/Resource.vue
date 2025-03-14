<script setup>
import { apiGetK8sAllRes } from '@/api/kube/kube'
import { onMounted, reactive, ref } from 'vue'
import { useServiceStore } from '@/stores'

const loadSpin = defineModel({
    type: String,
    default: () => ref()
})

const serviceStore = useServiceStore()
const color = reactive({
    '0%': '#73b9bc',
    '100%': '#109ee9'
})

const resourceList = ref()

const getK8sAllRes = async () => {
    loadSpin.value = true
    const res = await apiGetK8sAllRes({
        cluster: serviceStore.service.k8s_cluster
    })
    if (res.data) {
        resourceList.value = res.data || []
    }
    loadSpin.value = false
}

onMounted(() => {
    getK8sAllRes()
})
</script>

<template>
    <a-row :gutter="10">
        <template v-for="(val, key) in resourceList" :key="key">
            <a-col :span="4" style="margin-bottom: 10px">
                <a-card :bodyStyle="{ padding: '10px' }" :bordered="false" style="background-color: rgb(33, 46, 64)">
                    <div style="float: left; margin: 15px 10px 0px">
                        <!-- 进度条组件 strokeWidth是线条的粗细 -->
                        <a-progress :percent="100" :showInfo="false" :stroke-color="color" :strokeWidth="18" :width="40" type="circle"></a-progress>
                    </div>
                    <div style="text-align: center">
                        <span style="font-size: 14px">{{ key }}</span>
                        <br />
                        <span style="font-size: 30px; font-weight: bold">{{ val }}</span>
                    </div>
                </a-card>
            </a-col>
        </template>
    </a-row>
</template>

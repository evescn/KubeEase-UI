<script setup>
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()
</script>

<template>
    <a-row class="home-row1 ant">
        <a-col :span="7">
            <div style="font-size: 13px">名称</div>
            <div style="text-align: center; font-size: 30px; font-weight: bold">KubeEase</div>
        </a-col>
        <!--<a-divider style="height: 70px; background-color: rgb(89, 104, 173)" type="vertical"></a-divider>-->
        <a-col :span="10">
            <div style="font-size: 13px">集群数</div>
            <div style="text-align: center; font-size: 30px; font-weight: bold">
                {{ serviceStore.service.cluster_num }}
            </div>
        </a-col>
        <!--<a-divider style="height: 70px; background-color: rgb(89, 104, 173)" type="vertical"></a-divider>-->
        <a-col :span="7">
            <div style="font-size: 13px">版本号</div>
            <div style="text-align: center; font-size: 30px; font-weight: bold">v2.0.0</div>
        </a-col>
    </a-row>
</template>

<style scoped>
.home-row1 {
    background-color: rgb(40, 46, 58) !important;
    padding: 20px;
    margin-bottom: 15px;
}
</style>

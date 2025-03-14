<template>
    <a-layout-sider v-model:collapsed="collapsed" collapsible width="240">
        <AsideMenu />
    </a-layout-sider>
</template>

<script setup>
import AsideMenu from './AsideMenu.vue'
import { ref } from 'vue'

const collapsed = ref(false)
</script>

<style scoped>
/* 侧边栏滚轴 */
.ant-layout-sider {
    background: #141414 !important;
    overflow-y: auto;
}

.ant-layout-sider::-webkit-scrollbar {
    display: none;
}

.ant-menu-item {
    margin: 0 !important;
}
</style>

<template>
    <a-layout-content
        :style="{
            background: 'rgb(31, 30, 30)',
            margin: 10,
            minHeight: '280px',
            overflowY: 'auto'
        }"
    >
        <!--<router-view></router-view>-->
        <router-view v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
        </router-view>
    </a-layout-content>
</template>

<style scoped>
/* main滚轴的宽度 */
.ant-layout-content::-webkit-scrollbar {
    width: 6px;
}

.ant-layout-content::-webkit-scrollbar-track {
    background-color: rgb(164, 162, 162);
}

.ant-layout-content::-webkit-scrollbar-thumb {
    background-color: #666;
}
</style>
<script lang="ts" setup></script>

<script setup>
import HeaderLeftSide from './HeaderLeftSide.vue'
import HeaderRightSide from './HeaderRightSide.vue'
</script>

<template>
    <a-affix>
        <!-- 布局头部 -->
        <a-layout-header>
            <HeaderLeftSide />
            <HeaderRightSide />
        </a-layout-header>
    </a-affix>
</template>

<style scoped>
/* 头部内边距 */
.ant-layout-header {
    padding: 0 30px !important;
}
</style>

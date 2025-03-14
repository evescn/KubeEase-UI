<template>
    <a-menu :openKeys="openKeys" :selectedKeys="selectedKey" :style="{ height: '100%', boderRight: 0 }" mode="inline">
        <AsideMenuItem :openkey="openkey" :routes="routes" />
    </a-menu>
</template>

<script setup>
import { ref, toRefs, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores'
import AsideMenuItem from './AsideMenuItem.vue'

const route = useRoute()
const { routes } = toRefs(usePermissionStore())

const selectedKey = ref([])
const openKeys = ref([])

watchEffect(() => {
    selectedKey.value = [route.name]
    openKeys.value = route.matched.slice(0, -1).map((item) => item.name)
})
</script>

<style scoped>
.ant-menu-item {
    margin: 0 !important;
}
</style>

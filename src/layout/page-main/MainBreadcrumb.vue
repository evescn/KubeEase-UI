<template>
    <!-- 面包屑 -->
    <a-breadcrumb style="margin: 10px 0">
        <a-breadcrumb-item>
            <appstore-outlined />
        </a-breadcrumb-item>
        <template v-for="item in list">
            <a-breadcrumb-item v-if="item" :key="item">
                {{ item }}
            </a-breadcrumb-item>
        </template>
    </a-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = route.meta.breadcrumbs
const titleList = computed(() => {
    return route.matched.filter((route) => route.meta.title).map((route) => route.meta.title)
})
const list = breadcrumbs || titleList
</script>

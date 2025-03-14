<!-- Layout.vue -->
<template>
    <a-layout>
        <PageHeader />
        <a-layout style="height: calc(100vh - 68px)">
            <PageAside />
            <a-layout style="padding: 0 24px">
                <PageMain />
                <PageFooter />
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script setup>
import PageHeader from '@/layout/page-header/PageHeader.vue'
import PageAside from '@/layout/page-aside/PageAside.vue'
import PageMain from '@/layout/page-main/PageMain.vue'
import PageFooter from '@/layout/page-footer/PageFooter.vue'
</script>

<style scoped></style>

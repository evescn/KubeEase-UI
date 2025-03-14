<template>
    <template v-for="menu in routes">
        <template v-if="menu.children?.length && menu.hidden === 0">
            <!-- 处理无子路由的情况 -->
            <a-menu-item
                v-if="menu.children.length === 1"
                :key="menu.children[0].name"
                :index="menu.children[0].name"
                @click="jumpTo(menu.children[0].realPath)"
            >
                <template #icon>
                    <component :is="menu.meta.icon" />
                </template>
                <span>{{ menu.meta.title }}</span>
            </a-menu-item>

            <!-- 处理有子路由的情况,也就是父栏目 -->
            <a-sub-menu v-else :key="menu.name" :index="menu.name">
                <template #icon>
                    <component :is="menu.icon" />
                </template>
                <template #title>
                    {{ menu.meta.title }}
                </template>

                <!-- 子栏目（子路由）的处理 -->
                <AsideMenuItem :routes="menu.children" />
            </a-sub-menu>
        </template>
        <template v-else>
            <a-menu-item v-if="menu.hidden === 0" :key="menu.name" @click="jumpTo(menu.realPath)">
                <template #icon>
                    <component :is="menu.meta.icon" />
                </template>
                {{ menu.meta.title }}
            </a-menu-item>
        </template>
    </template>
</template>
<script setup>
import { useRouter } from 'vue-router'

defineProps({
    routes: {}
})

const router = useRouter()
const jumpTo = (path) => {
    router.push({
        path
    })
}
</script>

<style scoped>
.is-collapse {
    display: none;
}

.ant-menu-item {
    margin: 0 !important;
}
</style>

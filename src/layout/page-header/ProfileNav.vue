<script setup>
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 退出登陆
const logout = () => {
    userStore.removeToken()

    // 跳转到 /login 页面
    router.push('/login')
}
</script>

<template>
    <a-menu>
        <a-menu-item>
            <a @click="logout()">退出登陆</a>
        </a-menu-item>
        <!--<a-menu-item>-->
        <!--    <a @click="changePassword()">修改密码</a>-->
        <!--</a-menu-item>-->
    </a-menu>
</template>

<template>
    <!-- 用户信息 -->
    <div style="float: right">
        <img :src="avator" style="height: 40px; border-radius: 50px; margin-right: 10px" />
        <a-dropdown :overlayStyle="{ paddingTop: '20px' }">
            <!-- Admin-->
            <a>
                {{ username }}
                <down-outlined />
            </a>
            <template #overlay>
                <ProfileNav />
            </template>
        </a-dropdown>
    </div>
</template>

<script lang="ts" setup>
import ProfileNav from './ProfileNav.vue'
import avator from '@/assets/avator.png'
import { useUserStore } from '@/stores'

const useStore = useUserStore()

// username 信息
const username = useStore.user.username
</script>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLogin } from '@/api/rbac/rbac'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
    'rbac-user',
    () => {
        const token = ref('')
        const setToken = (newToken) => {
            token.value = newToken
        }
        const removeToken = () => {
            token.value = ''
        }

        const user = ref({})
        const getUser = async () => {
            const res = await userLogin() // 请求获取数据
            user.value = res.data.data
        }
        const setUser = (obj) => {
            user.value = obj
        }

        return {
            token,
            setToken,
            removeToken,
            user,
            getUser,
            setUser
        }
    },
    {
        persist: true
    }
)

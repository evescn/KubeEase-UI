<script setup>
import kubeLogo from '@/assets/k8s-metrics.png'
import { userLogin } from '@/api/rbac/rbac'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const formRef = ref()
const loginData = ref({})

const userStore = useUserStore()
const router = useRouter()
const login = async () => {
    await formRef.value.validate()

    const res = await userLogin(loginData.value)
    userStore.setToken(res.data.token)
    userStore.setUser(res.data)

    message.success('登录成功')
    router.push('/')
}
</script>

<template>
    <div class="login">
        <a-card :bodyStyle="{ padding: '20px' }" :headStyle="{ padding: '0px' }" class="login-card">
            <template #title>
                <div class="login-card-header">
                    <img :src="kubeLogo" style="height: 25px; margin: 0 8px 5px 0" />
                    <span>KubeEase</span>
                </div>
            </template>
            <a-form ref="formRef" :label-col="{ span: 5 }" :model="loginData">
                <a-form-item :rules="[{ required: true, message: '请输入账号' }]" label="用户名" name="username">
                    <a-input v-model:value="loginData.username"></a-input>
                </a-form-item>
                <a-form-item :rules="[{ required: true, message: '请输入密码' }]" label="密码" name="password">
                    <a-input-password v-model:value="loginData.password"></a-input-password>
                </a-form-item>
                <a-form-item style="text-align: center; margin-bottom: 10px">
                    <c-button icon="user-outlined" size="normal" style="width: 100%" type="primary" @click="login()">
                        登录
                    </c-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<style scoped>
/* 调整背景及布局 */
.login {
    height: 100vh;
    background-image: url(../../assets/login3.webp);
    background-size: 100%;
    display: grid;
    place-items: center;
}

.login-card {
    width: 350px;
}

.login-card-header {
    font-size: 18px;
    font-weight: 700;
    text-align: center;
}
</style>

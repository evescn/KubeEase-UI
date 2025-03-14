import axios from 'axios'
import { useUserStore } from '@/stores'
import router from '@/router'
import { message } from 'ant-design-vue'
import { baseHost } from '@/config'

const baseURL = baseHost

const instance = axios.create({
    // TODO 1. 基础地址，超时时间
    baseURL,
    timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        // TODO 2. 携带token
        const useStore = useUserStore()
        if (useStore.token) {
            config.headers.Authorization = useStore.token
        }
        return config
    },
    (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
    (res) => {
        // TODO 4. 摘取核心响应数据
        if (res.status === 200) {
            return res.data
        }

        if (!res.msg) {
            let res = {
                data: res.data,
                msg: '服务端异常: ' + res.status + ' ' + res.statusText
            }
        }
        // TODO 3. 处理业务失败
        // 处理业务失败, 给错误提示，抛出错误
        message.error(res.msg || '服务异常')
        return Promise.reject(res)
    },
    (err) => {
        // TODO 5. 处理401错误
        // 错误的特殊情况 => 401 权限不足 或 token 过期 => 拦截到登录
        if (err.response?.status === 401) {
            router.push('/login')
        }

        // 错误的默认情况 => 只要给提示
        message.error(err.response.data.msg || '服务异常')
        return Promise.reject(err)
    }
)

export default instance
export { baseURL }

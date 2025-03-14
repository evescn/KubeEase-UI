import { createRouter, createWebHistory } from 'vue-router'
import { usePermissionStore, useUserStore } from '@/stores'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    // history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            component: () => import('@/views/login/index.vue')
        }, // 登录页
        {
            path: '/',
            redirect: '/home/index'
        },
        {
            path: '/workload/pod/terminal', //url路径
            component: () => import('@/views/workload/pod/terminal/index.vue'), //视图组件
            meta: { title: '终端', requireAuth: false } //meta元信息
        },
        {
            path: '/workload/pod/log', //url路径
            component: () => import('@/views/workload/pod/log/index.vue'), //视图组件
            meta: { title: '日志', requireAuth: false } //meta元信息
        }
    ]
})

// 定义进度条
NProgress.inc(100)
// 进度条配置
// easing 动画字符串
// speed 动画速度
// showSpinner 进度环显示隐藏
NProgress.configure({ easing: 'ease', speed: 600, showSpinner: false })

// 结合路由守卫，去开启和关闭进度条
router.beforeEach((to, from, next) => {
    // 启动进度条
    NProgress.start()

    // 设置头部 title
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'kube'
    }

    // 放行
    next()
})

router.beforeEach(async (to, from, next) => {
    const store = usePermissionStore()
    // 如果没有token, 且访问的是非登录页，拦截到登录，其他情况正常放行
    const useStore = useUserStore()
    if (to.path === '/login') {
        next()
    } else if (!useStore.token && to.path !== '/login') {
        next('/login')
    } else {
        // 设置路由
        if (!store.permission) {
            await store.setPermission()
            store.routes.forEach((item) => {
                router.addRoute(item)
            })
            next(to)
        }
        next()
    }
})

router.afterEach(() => {
    // 关闭进度条
    NProgress.done()
})

export default router

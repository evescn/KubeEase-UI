import rbac from '@/utils/rbac'

// 用户登录权限接口
export function getPermission(params) {
    return rbac.get(`/api/menu/list`, { params: params })
}

// 页面权限接口
export function userLogin(params) {
    return rbac.post(`/api/login`, params)
}

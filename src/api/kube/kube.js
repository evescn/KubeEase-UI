import request from '@/utils/request'

// k8s all res 接口
export function apiGetK8sAllRes(params) {
    return request.get(`/api/k8s/allres`, { params: params })
}

// events 事件
export function apiGetK8sEvents(params) {
    return request.get(`/api/k8s/events`, { params: params })
}

// cluster list
export function apiGetK8sClusterList(params) {
    return request.get(`/api/k8s/clusters`, { params: params })
}

// node
export function apiGetNodesList(params) {
    return request.get(`/api/k8s/nodes`, { params: params })
}

export function apiGetNodeDetail(params) {
    return request.get(`/api/k8s/node/detail`, { params: params })
}

// namespace
export function apiGetNameSpacesList(params) {
    return request.get(`/api/k8s/namespaces`, { params: params })
}

export function apiGetNameSpaceDetail(params) {
    return request.get(`/api/k8s/namespace/detail`, { params: params })
}

export function apiDelNameSpace(params) {
    return request.delete(`/api/k8s/namespace/del`, { data: params })
}

// pv
export function apiGetPvsList(params) {
    return request.get(`/api/k8s/pvs`, { params: params })
}

export function apiGetPvDetail(params) {
    return request.get(`/api/k8s/pv/detail`, { params: params })
}

export function apiDelPv(params) {
    return request.delete(`/api/k8s/pv/del`, { data: params })
}

// pod
export function apiGetPodsList(params) {
    return request.get(`/api/k8s/pods`, { params: params })
}

export function apiGetPodDetail(params) {
    return request.get(`/api/k8s/pod/detail`, { params: params })
}

export function apiUpdatePod(params) {
    return request.put(`/api/k8s/pod/update`, params)
}

export function apiDelPod(params) {
    return request.delete(`/api/k8s/pod/del`, { data: params })
}

export function apiGetPodContainer(params) {
    return request.get(`/api/k8s/pod/container`, { params: params })
}

export function apiGetPodLog(params) {
    return request.get(`/api/k8s/pod/log`, { params: params })
}

// k8sTerminalWs: wsHost + '/ws',

// deployment
export function apiGetDeploymentsList(params) {
    return request.get(`/api/k8s/deployments`, { params: params })
}

export function apiGetDeploymentDetail(params) {
    return request.get(`/api/k8s/deployment/detail`, { params: params })
}

export function apiUpdateDeployment(params) {
    return request.put(`/api/k8s/deployment/update`, params)
}

export function apiDelDeployment(params) {
    return request.delete(`/api/k8s/deployment/del`, { data: params })
}

export function apiScaleDeployment(params) {
    return request.put(`/api/k8s/deployment/scale`, params)
}

export function apiCreateDeployment(params) {
    return request.post(`/api/k8s/deployment/create`, params)
}

export function apiRestartDeployment(params) {
    return request.put(`/api/k8s/deployment/restart`, params)
}

//daemonset
export function apiGetDaemonSetsList(params) {
    return request.get(`/api/k8s/daemonsets`, { params: params })
}

export function apiGetDaemonSetDetail(params) {
    return request.get(`/api/k8s/daemonset/detail`, { params: params })
}

export function apiUpdateDaemonSet(params) {
    return request.put(`/api/k8s/daemonset/update`, params)
}

export function apiDelDaemonSet(params) {
    return request.delete(`/api/k8s/daemonset/del`, { data: params })
}

// statefulset
export function apiGetStatefulSetsList(params) {
    return request.get(`/api/k8s/statefulsets`, { params: params })
}

export function apiGetStatefulSetDetail(params) {
    return request.get(`/api/k8s/statefulset/detail`, { params: params })
}

export function apiUpdateStatefulSet(params) {
    return request.put(`/api/k8s/statefulset/update`, params)
}

export function apiDelStatefulSet(params) {
    return request.delete(`/api/k8s/statefulset/del`, { data: params })
}

// service
export function apiGetSvcsList(params) {
    return request.get(`/api/k8s/services`, { params: params })
}

export function apiGetSvcDetail(params) {
    return request.get(`/api/k8s/service/detail`, { params: params })
}

export function apiUpdateSvc(params) {
    return request.put(`/api/k8s/service/update`, params)
}

export function apiDelSvc(params) {
    return request.delete(`/api/k8s/service/del`, { data: params })
}

export function apiCreateSvc(params) {
    return request.post(`/api/k8s/service/create`, params)
}

// ingress
export function apiGetIngresssList(params) {
    return request.get(`/api/k8s/ingresses`, { params: params })
}

export function apiGetIngressDetail(params) {
    return request.get(`/api/k8s/ingress/detail`, { params: params })
}

export function apiUpdateIngress(params) {
    return request.put(`/api/k8s/ingress/update`, params)
}

export function apiDelIngress(params) {
    return request.delete(`/api/k8s/ingress/del`, { data: params })
}

export function apiCreateIngress(params) {
    return request.post(`/api/k8s/ingress/create`, params)
}

//configmap
export function apiGetConfigmapsList(params) {
    return request.get(`/api/k8s/configmaps`, { params: params })
}

export function apiGetConfigmapDetail(params) {
    return request.get(`/api/k8s/configmap/detail`, { params: params })
}

export function apiUpdateConfigmap(params) {
    return request.put(`/api/k8s/configmap/update`, params)
}

export function apiDelConfigmap(params) {
    return request.delete(`/api/k8s/configmap/del`, { data: params })
}

//secret
export function apiGetSecretsList(params) {
    return request.get(`/api/k8s/secrets`, { params: params })
}

export function apiGetSecretDetail(params) {
    return request.get(`/api/k8s/secret/detail`, { params: params })
}

export function apiUpdateSecret(params) {
    return request.put(`/api/k8s/secret/update`, params)
}

export function apiDelSecret(params) {
    return request.delete(`/api/k8s/secret/del`, { data: params })
}

//pvc
export function apiGetPvcsList(params) {
    return request.get(`/api/k8s/pvcs`, { params: params })
}

export function apiGetPvcDetail(params) {
    return request.get(`/api/k8s/pvc/detail`, { params: params })
}

export function apiUpdatePvc(params) {
    return request.put(`/api/k8s/pvc/update`, params)
}

export function apiDelPvc(params) {
    return request.delete(`/api/k8s/pvc/del`, { data: params })
}

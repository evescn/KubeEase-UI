<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiDelPod, apiGetPodDetail, apiGetPodsList, apiUpdatePod } from '@/api/kube/kube'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import YAML from 'js-yaml'
import { useRouter } from 'vue-router'

const router = useRouter()

const serviceStore = useServiceStore()
const query = ref({
    page: 1,
    size: 10,
    cluster: serviceStore.service.k8s_cluster,
    filter_name: '',
    namespace: ''
})

const columns = ref([
    {
        title: 'POD名',
        dataIndex: 'name'
    },
    {
        title: '节点',
        dataIndex: 'node'
    },
    {
        title: '状态',
        dataIndex: 'state',
        width: 120
    },
    {
        title: '重启数',
        dataIndex: 'restarts'
    },
    {
        title: '镜像',
        dataIndex: 'image'
    },
    {
        title: '创建时间',
        dataIndex: 'creationTimestamp'
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 200
    }
])
const podList = ref([])
const appLoading = ref(true)

async function getPodList() {
    appLoading.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetPodsList(params)
    podList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getPodList()
}

function getSearchValue(params) {
    query.value.page = 1
    query.value.filter_name = params
}

function getNamespaceValue(params) {
    query.value.page = 1
    query.value.namespace = params
}

//获取容器重启次数
function restartTotal(e) {
    let index,
        sum = 0
    let containerStatuses = e.status.containerStatuses
    for (index in containerStatuses) {
        sum = sum + containerStatuses[index].restartCount
    }
    return sum
}

//截取容器名称中前面的镜像仓库地址
function ellipsis(val, len) {
    return val.length > len ? val.substring(0, len) + '...' : val
}

// YAML
const yamlModelData = ref({
    contentYaml: '',
    yamlModel: false
})

async function getPodDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        pod_name: val.metadata.name
    }

    const res = await apiGetPodDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updatePod() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdatePod(params)
        message.success(res.msg)
        getPodList()
        yamlModelData.value = {}
    } catch (error) {
        yamlModelData.value = {}
    }
}

function transYaml(content) {
    return YAML.dump(content)
}

function transObj(content) {
    return YAML.load(content)
}

async function delPod(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        pod_name: name
    }

    const res = await apiDelPod(params)
    message.success(res.msg)
    getPodList()
}

//跳转日志页
function gotoLog(e) {
    let routeUrl = router.resolve({
        path: '/workload/pod/log',
        query: {
            pod_name: e.metadata.name,
            namespace: e.metadata.namespace,
            cluster: serviceStore.service.k8s_cluster
        }
    })
    window.open(routeUrl.href, '_blank')
}

//跳转终端页
function gotoTerminal(record) {
    let routeUrl = router.resolve({
        path: '/workload/pod/terminal',
        query: {
            pod_name: record.metadata.name,
            namespace: record.metadata.namespace,
            cluster: serviceStore.service.k8s_cluster
        }
    })
    window.open(routeUrl.href, '_blank')
}
</script>

<template>
    <MainHead namespace searchDescribe="请输入" @dataList="getPodList" @namespaceChange="getNamespaceValue" @searchChange="getSearchValue"></MainHead>
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="columns" :dataSource="podList" :loading="appLoading" :pagination="false" style="font-size: 12px">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <span style="font-weight: bold">{{ record.metadata.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'node'">
                    <span style="color: rgb(84, 138, 238)">{{ record.spec.nodeName }}</span>
                </template>
                <template v-if="column.dataIndex === 'state'">
                    <div
                        :class="{
                            'succ-dot': record.status.phase === 'Running',
                            'warn-dot': record.status.phase === 'Pending',
                            'err-dot': record.status.phase !== 'Running' && record.status.phase !== 'Pending'
                        }"
                    ></div>
                    <span
                        :class="{
                            'succ-state': record.status.phase === 'Running',
                            'warn-state': record.status.phase === 'Pending',
                            'err-status': record.status.phase !== 'Running' && record.status.phase !== 'Pending'
                        }"
                    >
                        {{ record.status.phase }}
                    </span>
                </template>
                <template v-if="column.dataIndex === 'restarts'">
                    <span>{{ restartTotal(record) }}</span>
                </template>
                <template v-if="column.dataIndex === 'image'">
                    <div v-for="(val, key) in record.spec.containers" :key="key">
                        <a-popover>
                            <template #content>
                                <span>{{ val.image }}</span>
                            </template>
                            <a-tag color="geekblue" style="margin-bottom: 5px; cursor: pointer">
                                {{ ellipsis(val.image.split('/').pop() ? val.image.split('/').pop() : val.image, 100) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="pod-button" icon="form-outlined" type="primary" @click="getPodDetail(record)">YML </c-button>
                    <c-button class="pod-button" icon="delete-outlined" style="margin-bottom: 5px" type="error" @click="showConfirm('删除', record.metadata.name, delPod)">删除 </c-button>
                    <c-button class="pod-button" icon="file-search-outlined" type="warning" @click="gotoLog(record)"> 日志 </c-button>
                    <c-button class="pod-button" icon="code-outlined" type="warning" @click="gotoTerminal(record)"> 终端 </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager :length="podList?.length || 0" :loading="appLoading" :pageNum="query.page" :pageSize="query.size" @change="onPageChange" />
                        </div>
                    </a-col>
                </a-row>
            </template>
        </a-table>
    </a-card>

    <ModalYaml v-model="yamlModelData" @update="updatePod" />
</template>

<style scoped>
.pod-button {
    margin-right: 5px;
}

.ant-btn {
    border-radius: 1px;
}

.succ-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #86c169;
    border-radius: 50%;
    border: 1px solid #88c06c;
    margin-right: 10px;
}

.warn-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: rgb(233, 200, 16);
    border-radius: 50%;
    border: 1px solid rgb(233, 200, 16);
    margin-right: 10px;
}

.err-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: rgb(199, 85, 85);
    border-radius: 50%;
    border: 1px solid rgb(207, 94, 94);
    margin-right: 10px;
}

.succ-state {
    color: rgb(27, 202, 21);
}

.warn-state {
    color: rgb(233, 200, 16);
}

.err-state {
    color: rgb(226, 23, 23);
}
</style>

<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiCreateIngress, apiDelIngress, apiGetIngressDetail, apiGetIngresssList, apiUpdateIngress } from '@/api/kube/kube'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import YAML from 'js-yaml'
import ModalCreate from './components/ModalCreate.vue'

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
        title: 'Ingress名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: 'Host',
        dataIndex: 'host'
    },
    {
        title: 'Path',
        dataIndex: 'path'
    },
    {
        title: 'EXTERNAL-IP',
        dataIndex: 'external-ip'
    },
    {
        title: 'TLS',
        dataIndex: 'tls'
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
const ingressList = ref([])
const appLoading = ref(false)

async function getIngressList() {
    appLoading.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetIngresssList(params)
    ingressList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getIngressList()
}

function getSearchValue(params) {
    query.value.page = 1
    query.value.filter_name = params
}

function getNamespaceValue(params) {
    query.value.page = 1
    query.value.namespace = params
}

function ellipsis(val, len) {
    return val.length > len ? val.substring(0, len) + '...' : val
}

// edit YAML
const yamlModelData = ref({
    contentYaml: '',
    yamlModel: false
})

async function getIngressDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        ingress_name: val.metadata.name
    }

    const res = await apiGetIngressDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updateIngress() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdateIngress(params)
        message.success(res.msg)
        getIngressList()
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

async function delIngress(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        ingress_name: name
    }

    const res = await apiDelIngress(params)
    message.success(res.msg)
    getIngressList()
}

// handleCreate
const createModelData = ref({
    createDrawer: false,
    createIngress: {
        name: '',
        namespace: '',
        host: '',
        path: '',
        path_type: '',
        service_name: '',
        service_port: '',
        createLabelStr: ''
    }
})

function handleCreate() {
    createModelData.value.createDrawer = true
}

async function createIngress() {
    const { name, namespace, host, path, path_type, service_name, service_port, createLabelStr } =
        createModelData.value.createIngress
    let reg = new RegExp('(^[A-Za-z]+=[A-Za-z0-9]+).*')
    if (!reg.test(createLabelStr)) {
        message.warning('标签填写异常，请确认后重新填写')
        return
    }
    appLoading.value = true

    let label = new Map()
    let labelArr = createLabelStr.split(',')
    labelArr.forEach((item) => {
        let labelStr = item.split('=')
        label[labelStr[0]] = labelStr[1]
    })

    // 处理Hosts
    let hosts = new Map()
    let httpPaths = []
    let httpPath = {
        path: path,
        path_type: path_type,
        service_name: service_name,
        service_port: parseInt(service_port)
    }
    httpPaths.push(httpPath)
    hosts[host] = httpPaths
    let params = {
        name: name,
        namespace: namespace,
        label: label,
        hosts: hosts,
        cluster: serviceStore.service.k8s_cluster
    }

    const res = await apiCreateIngress(params)
    message.success(res.msg)
    getIngressList()

    createModelData.value = {
        createDrawer: false,
        createIngress: {
            name: '',
            namespace: '',
            path: '',
            path_type: '',
            service_name: '',
            service_port: '',
            createLabelStr: ''
        }
    }
}
</script>

<template>
    <MainHead
        add
        namespace
        searchDescribe="请输入"
        @addFunc="handleCreate"
        @dataList="getIngressList"
        @namespaceChange="getNamespaceValue"
        @searchChange="getSearchValue"
    />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="columns" :dataSource="ingressList" :loading="appLoading" :pagination="false" style="font-size: 12px">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <span style="font-weight: bold">{{ record.metadata.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'labels'">
                    <div v-for="(val, key) in record.metadata.labels" :key="key">
                        <a-popover>
                            <template #content>
                                <span>{{ key + ':' + val }}</span>
                            </template>
                            <a-tag color="blue" style="margin-bottom: 5px; cursor: pointer">
                                {{ ellipsis(key + ':' + val, 15) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'host'">
                    <div v-for="(val, key) in record.spec.rules" :key="key">
                        <a-popover>
                            <template #content>
                                <span>{{ val.host }}</span>
                            </template>
                            <a-tag color="green" style="margin-bottom: 5px; cursor: pointer">{{ ellipsis(val.host, 15) }} </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'path'">
                    <div v-for="(val, key) in record.spec.rules" :key="key">
                        <a-popover>
                            <template #content>
                                <span>{{ val.http.paths[0].path }}</span>
                            </template>
                            <a-tag color="green" style="margin-bottom: 5px; cursor: pointer">
                                {{ ellipsis(val.http.paths[0].path, 15) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'external-ip'">
                    <span>{{ record.status.loadBalancer.ingress ? record.status.loadBalancer.ingress[0].ip : '' }} </span>
                </template>
                <template v-if="column.dataIndex === 'tls'">
                    <span>{{ record.spec.tls ? 'YES' : '' }} </span>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button
                        class="ingress-button"
                        icon="form-outlined"
                        style="margin-bottom: 5px"
                        type="primary"
                        @click="getIngressDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="ingress-button"
                        icon="delete-outlined"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delIngress)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="ingressList?.length || 0"
                                :loading="appLoading"
                                :pageNum="query.page"
                                :pageSize="query.size"
                                @change="onPageChange"
                            />
                        </div>
                    </a-col>
                </a-row>
            </template>
        </a-table>
    </a-card>

    <ModalYaml v-model="yamlModelData" @update="updateIngress" />
    <ModalCreate v-model="createModelData" @create="createIngress" />
</template>

<style scoped>
.ingress-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

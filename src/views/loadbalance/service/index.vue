<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiCreateSvc, apiDelSvc, apiGetSvcDetail, apiGetSvcsList, apiUpdateSvc } from '@/api/kube/kube'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import YAML from 'js-yaml'
import ModalCreate from './components/ModalCreate.vue'
import Pager from '@/components/Pager.vue'

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
        title: 'Svc名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: '类型',
        dataIndex: 'type'
    },
    {
        title: 'CLUSTER-IP',
        dataIndex: 'cluster-ip'
    },
    {
        title: 'EXTERNAL-IP',
        dataIndex: 'external-ip'
    },
    {
        title: '端口',
        dataIndex: 'port'
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
const svcList = ref([])
const appLoading = ref(false)

async function getSvcList() {
    appLoading.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetSvcsList(params)
    svcList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getSvcList()
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

async function getSvcDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        svc_name: val.metadata.name
    }

    const res = await apiGetSvcDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updateSvc() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdateSvc(params)
        message.success(res.msg)
        getSvcList()
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

async function delSvc(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        svc_name: name
    }

    const res = await apiDelSvc(params)
    message.success(res.msg)
    getSvcList()
}

// handleCreate
const createModelData = ref({
    createDrawer: false,
    createSvc: {
        name: '',
        namespace: '',
        type: '',
        container_port: '',
        port: '',
        node_port: '',
        createLabelStr: ''
    }
})

function handleCreate() {
    createModelData.value.createDrawer = true
}

async function createSvc() {
    const { name, namespace, type, container_port, port, node_port, createLabelStr } = createModelData.value.createSvc
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

    let params = {
        name: name,
        namespace: namespace,
        type: type,
        container_port: parseInt(container_port),
        port: parseInt(port),
        node_port: parseInt(node_port),
        label: label,
        cluster: serviceStore.service.k8s_cluster
    }

    const res = await apiCreateSvc(params)
    message.success(res.msg)
    getSvcList()

    createModelData.value = {
        createDrawer: false,
        createSvc: {
            name: '',
            namespace: '',
            type: '',
            container_port: '',
            port: '',
            node_port: '',
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
        @dataList="getSvcList"
        @namespaceChange="getNamespaceValue"
        @searchChange="getSearchValue"
    />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="columns" :dataSource="svcList" :loading="appLoading" :pagination="false" style="font-size: 12px">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <span style="font-weight: bold">{{ record.metadata.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'labels'">
                    <div v-for="(val, key) in record.metadata.labels" :key="key">
                        <a-popover>
                            <template #content>
                                <span> {{ key + ': ' + val }}</span>
                            </template>
                            <a-tag color="blue" style="margin-bottom: 3px; cursor: pointer"
                                >{{ ellipsis(key + ': ' + val, 15) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'type'">
                    <a-tag color="cyan">{{ record.spec.type }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'cluster-ip'">
                    <!-- <span>{{ record.spec.clusterIPs }}</span> -->
                    <div v-for="(val, key) in record.spec.clusterIPs" :key="key">
                        <a-tag color="pink">{{ val }}</a-tag>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'external-ip'">
                    <span>{{ record.status.loadBalancer.svc ? record.status.loadBalancer.svc[0].ip : '-' }} </span>
                </template>
                <template v-if="column.dataIndex === 'port'">
                    <div v-for="(val, key) in record.spec.ports" :key="key">
                        <a-tag v-if="!val.nodePort" color="orange" style="margin-bottom: 5px; cursor: pointer"
                            >{{ val.name + ': ' + val.port }}/{{ val.protocol }}
                        </a-tag>
                        <a-tag v-if="val.nodePort" color="orange" style="margin-bottom: 5px; cursor: pointer"
                            >{{ val.name + ': ' + val.port }}:{{ val.nodePort }}/{{ val.protocol }}
                        </a-tag>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="svc-button" icon="form-outlined" type="primary" @click="getSvcDetail(record)">YML </c-button>
                    <c-button
                        class="svc-button"
                        icon="delete-outlined"
                        style="margin-bottom: 5px"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delSvc)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="svcList?.length || 0"
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
    <ModalYaml v-model="yamlModelData" @update="updateSvc" />
    <ModalCreate v-model="createModelData" @create="createSvc" />
</template>

<style scoped>
.svc-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

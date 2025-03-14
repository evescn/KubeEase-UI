<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import {
    apiCreateDeployment,
    apiDelDeployment,
    apiGetDeploymentDetail,
    apiGetDeploymentsList,
    apiRestartDeployment,
    apiScaleDeployment,
    apiUpdateDeployment
} from '@/api/kube/kube'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import YAML from 'js-yaml'
import ModalScale from './components/ModalScale.vue'
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
        title: 'Deployment名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: '容器组',
        dataIndex: 'containers'
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
const deploymentList = ref([])
const appLoading = ref(false)

async function getDeploymentList() {
    appLoading.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetDeploymentsList(params)
    deploymentList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getDeploymentList()
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

async function getDeploymentDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        deployment_name: val.metadata.name
    }

    const res = await apiGetDeploymentDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updateDeployment() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdateDeployment(params)
        message.success(res.msg)
        getDeploymentList()
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

async function delDeployment(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        deployment_name: name
    }

    const res = await apiDelDeployment(params)
    message.success(res.msg)
    getDeploymentList()
}

// handleScale
const scaleModelData = ref({
    name: '',
    scaleNum: '',
    scaleModel: false
})

function handleScale(record) {
    scaleModelData.value.name = record.metadata.name
    scaleModelData.value.scaleNum = record.spec.replicas
    scaleModelData.value.scaleModel = true
    scaleModelData.value.appLoading = false
}

async function scaleDeployment() {
    scaleModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        deployment_name: scaleModelData.value.name,
        scale_num: scaleModelData.value.scaleNum
    }

    const res = await apiScaleDeployment(params)
    message.success(res.msg)
    getDeploymentList()
    scaleModelData.value = {}
}

// handleCreate
const createModelData = ref({
    createDrawer: false,
    createDeployment: {
        name: '',
        namespace: '',
        replicas: 1,
        image: '',
        createResource: '',
        health_check: false,
        health_path: '',
        createLabelStr: '',
        container_port: ''
    }
})

function handleCreate() {
    createModelData.value.createDrawer = true
}

async function createDeployment() {
    let reg = new RegExp('(^[A-Za-z]+=[A-Za-z0-9]+).*')
    if (!reg.test(createModelData.value.createDeployment.createLabelStr)) {
        message.warning('标签填写异常，请确认后重新填写')
        return
    }
    appLoading.value = true

    let label = new Map()
    let labelArr = createModelData.value.createDeployment.createLabelStr.split(',')
    labelArr.forEach((item) => {
        let labelStr = item.split('=')
        label[labelStr[0]] = labelStr[1]
    })

    let params = {
        ...createModelData.value.createDeployment,
        container_port: parseInt(createModelData.value.createDeployment.container_port),
        label: label,
        cpu: createModelData.value.createDeployment.createResource.split('/')[0],
        memory: createModelData.value.createDeployment.createResource.split('/')[1] + 'Gi',
        cluster: serviceStore.service.k8s_cluster
    }

    const res = await apiCreateDeployment(params)
    message.success(res.msg)
    getDeploymentList()

    createModelData.value = {
        createDrawer: false,
        createDeployment: {
            name: '',
            namespace: '',
            replicas: 1,
            image: '',
            createResource: '',
            health_check: false,
            health_path: '',
            createLabelStr: '',
            container_port: ''
        }
    }
}

// restart
async function restartDeployment(name) {
    appLoading.value = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        deployment_name: name
    }

    const res = await apiRestartDeployment(params)
    message.success(res.msg)
    getDeploymentList()
    appLoading.value = false
}
</script>

<template>
    <MainHead
        add
        namespace
        searchDescribe="请输入"
        @addFunc="handleCreate"
        @dataList="getDeploymentList"
        @namespaceChange="getNamespaceValue"
        @searchChange="getSearchValue"
    />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table
            :columns="columns"
            :dataSource="deploymentList"
            :loading="appLoading"
            :pagination="false"
            style="font-size: 12px"
        >
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
                            <a-tag color="blue" style="margin-bottom: 3px; cursor: pointer">
                                {{ ellipsis(key + ': ' + val, 15) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'containers'">
                    <span style="font-weight: bold"
                        >{{ record.status.availableReplicas > 0 ? record.status.availableReplicas : 0 }} /
                        {{ record.spec.replicas > 0 ? record.spec.replicas : 0 }}</span
                    >
                </template>
                <template v-if="column.dataIndex === 'image'">
                    <div v-for="(val, key) in record.spec.template.spec.containers" :key="key">
                        <a-popover>
                            <template #content>
                                <span> {{ val.image }}</span>
                            </template>
                            <a-tag color="geekblue" style="margin-bottom: 3px; cursor: pointer">
                                {{ ellipsis(val.image.split('/').pop() ? val.image.split('/').pop() : val.image, 100) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                    <!-- <a-tag color="gray">{{ record.metadata.creationTimestamp }}</a-tag> -->
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="deployment-button" icon="form-outlined" type="primary" @click="getDeploymentDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="deployment-button"
                        icon="delete-outlined"
                        style="margin-bottom: 5px"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delDeployment)"
                        >删除
                    </c-button>
                    <c-button class="deployment-button" icon="block-outlined" type="warning" @click="handleScale(record)"
                        >扩容
                    </c-button>
                    <c-button
                        class="deployment-button"
                        icon="retweet-outlined"
                        type="warning"
                        @click="showConfirm('重启', record.metadata.name, restartDeployment)"
                        >重启
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="deploymentList?.length || 0"
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

    <ModalYaml v-model="yamlModelData" @update="updateDeployment" />
    <ModalScale v-model="scaleModelData" @scale="scaleDeployment" />
    <ModalCreate v-model="createModelData" @create="createDeployment" />
</template>

<style scoped>
.deployment-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

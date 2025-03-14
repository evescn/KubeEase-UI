<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiDelPvc, apiGetPvcDetail, apiGetPvcsList, apiUpdatePvc } from '@/api/kube/kube'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import YAML from 'js-yaml'

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
        title: 'Pvc名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: '状态',
        dataIndex: 'status'
    },
    {
        title: '容量',
        dataIndex: 'storage'
    },
    {
        title: '访问模式',
        dataIndex: 'accessMode'
    },
    {
        title: 'StorageClass',
        dataIndex: 'storageclass'
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
const pvcList = ref([])
const appLoading = ref(false)

async function getPvcList() {
    appLoading.value = true
    const { size } = query.value
    let params = {
        ...query.value,
        limit: size
    }
    const res = await apiGetPvcsList(params)
    pvcList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getPvcList()
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

async function getPvcDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        pvc_name: val.metadata.name
    }

    const res = await apiGetPvcDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updatePvc() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdatePvc(params)
        message.success(res.msg)
        getPvcList()
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

async function delPvc(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        pvc_name: name
    }

    const res = await apiDelPvc(params)
    message.success(res.msg)
    getPvcList()
}
</script>

<template>
    <MainHead namespace @dataList="getPvcList" @namespaceChange="getNamespaceValue" @searchChange="getSearchValue" />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="columns" :dataSource="pvcList" :loading="appLoading" :pagination="false" style="font-size: 12px">
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
                <template v-if="column.dataIndex === 'status'">
                    <span :class="[record.status.phase === 'Bound' ? 'success-status' : 'error-status']">{{
                        record.status.phase
                    }}</span>
                </template>
                <template v-if="column.dataIndex === 'storage'">
                    <span>{{ record.status.capacity.storage }}</span>
                </template>
                <template v-if="column.dataIndex === 'accessMode'">
                    <span style="color: rgb(84, 138, 238); font-weight: bold">{{ record.status.accessModes[0] }}</span>
                </template>
                <template v-if="column.dataIndex === 'storageclass'">
                    <span>{{ record.spec.storageClassName }}</span>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button
                        class="pvc-button"
                        icon="form-outlined"
                        style="margin-bottom: 5px"
                        type="primary"
                        @click="getPvcDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="pvc-button"
                        icon="delete-outlined"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delPvc)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="pvcList?.length || 0"
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
    <ModalYaml v-model="yamlModelData" @update="updatePvc" />
</template>

<style scoped>
.pvc-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

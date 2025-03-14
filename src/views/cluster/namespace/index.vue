<script setup>
import { ref } from 'vue'
import { apiDelNameSpace, apiGetNameSpaceDetail, apiGetNameSpacesList } from '@/api/kube/kube'
import { useServiceStore } from '@/stores'
import YAML from 'js-yaml'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    size: 10,
    cluster: serviceStore.service.k8s_cluster,
    filter_name: ''
})

const tableColumns = ref([
    {
        title: 'Namespace名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status'
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
const tableData = ref([])
const loadTable = ref(true)

// 获取列表
async function getNamespaceList() {
    loadTable.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetNameSpacesList(params)
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getNamespaceList()
}

// 搜索
function handleSearch(params) {
    query.value.page = 1
    query.value.filter_name = params
}

//截取标签名称
function ellipsis(val, len) {
    return val.length > len ? val.substring(0, len) + '...' : val
}

// YAML
const yamlModelData = ref({
    contentYaml: '',
    yamlModel: false
})

async function getNamespaceDetail(val) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace_name: val.metadata.name
    }
    const res = await apiGetNameSpaceDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.isView = true
}

function transYaml(content) {
    return YAML.dump(content)
}

async function delNamespace(name) {
    let params = {
        namespace_name: name,
        cluster: serviceStore.service.k8s_cluster
    }
    const res = await apiDelNameSpace(params)
    message.success(res.msg)
    getNamespaceList()
}
</script>

<template>
    <MainHead @dataList="getNamespaceList" @searchChange="handleSearch" />
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table
            :columns="tableColumns"
            :dataSource="tableData"
            :loading="loadTable"
            :pagination="false"
            row-key="id"
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
                            <a-tag color="blue" style="margin-bottom: 3px; cursor: pointer"
                                >{{ ellipsis(key + ': ' + val, 15) }}
                            </a-tag>
                        </a-popover>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'status'">
                    <span :class="[record.status.phase === 'Active' ? 'success-status' : 'error-status']">{{
                        record.status.phase
                    }}</span>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="namespace-button" icon="form-outlined" type="primary" @click="getNamespaceDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="namespace-button"
                        icon="delete-outlined"
                        style="margin-bottom: 5px"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delNamespace)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="tableData?.length || 0"
                                :loading="loadTable"
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
    <ModalYaml v-model="yamlModelData" />
</template>

<style scoped>
.namespace-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}

.success-status {
    color: rgb(27, 202, 21);
}

.warning-status {
    color: rgb(233, 200, 16);
}

.error-status {
    color: rgb(226, 23, 23);
}
</style>

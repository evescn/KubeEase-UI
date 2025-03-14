<script setup>
import { ref } from 'vue'
import { apiDelPv, apiGetPvDetail, apiGetPvsList } from '@/api/kube/kube'
import { useServiceStore } from '@/stores'
import YAML from 'js-yaml'
import { showConfirm } from '@/utils/modal'
import { message } from 'ant-design-vue'
import ModalYaml from '@/components/Model/index.vue'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    size: 10,
    cluster: serviceStore.service.k8s_cluster,
    filter_name: ''
})

const tableColumns = ref([
    {
        title: 'Pv名',
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
        title: 'PVC',
        dataIndex: 'pvc'
    },
    {
        title: 'PVC名称空间',
        dataIndex: 'namespace'
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
async function getPvList() {
    loadTable.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetPvsList(params)
    // debugger
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getPvList()
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

async function getPvDetail(val) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        pv_name: val.metadata.name
    }
    const res = await apiGetPvDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.isView = true
}

function transYaml(content) {
    return YAML.dump(content)
}

async function delPv(name) {
    let params = {
        pv_name: name,
        cluster: serviceStore.service.k8s_cluster
    }
    const res = await apiDelPv(params)
    message.success(res.msg)
    getPvList()
}
</script>

<template>
    <MainHead @dataList="getPvList" @searchChange="handleSearch" />
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
                        <a-popover title="Title">
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
                    <span :class="[record.status.phase === 'Bound' ? 'success-status' : 'error-status']">{{
                        record.status.phase
                    }}</span>
                </template>
                <template v-if="column.dataIndex === 'storage'">
                    <a-tag color="orange">{{ record.spec.capacity.storage }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'accessMode'">
                    <div v-for="(val, key) in record.spec.accessModes" :key="key">
                        <a-tag color="cyan" style="margin-bottom: 5px; cursor: pointer">{{ val }}</a-tag>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'pvc'">
                    <span>{{ record.spec.claimRef.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'namespace'">
                    <a-tag color="blue" style="margin-bottom: 5px; cursor: pointer">{{ record.spec.claimRef.namespace }} </a-tag>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="pv-button" icon="form-outlined" type="primary" @click="getPvDetail(record)">YML </c-button>
                    <c-button
                        class="pv-button"
                        icon="delete-outlined"
                        style="margin-bottom: 5px"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delPv)"
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
.pv-button {
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

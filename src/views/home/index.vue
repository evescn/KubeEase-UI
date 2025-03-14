<script setup>
import PlatformInfo from './components/PlatformInfo.vue'
import Resource from './components/Resource.vue'
import SearchForm from './components/SearchForm.vue'
import { apiGetK8sEvents } from '@/api/kube/kube'
import { onMounted, ref } from 'vue'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    size: 10,
    cluster: serviceStore.service.k8s_cluster
})

const tableColumns = ref([
    {
        title: '资源名',
        dataIndex: 'name'
    },
    {
        title: '资源类型',
        dataIndex: 'kind'
    },
    {
        title: '命名空间',
        dataIndex: 'namespace'
    },
    {
        title: '状态',
        dataIndex: 'rtype'
    },
    {
        title: '原因',
        dataIndex: 'reason'
    },
    {
        title: '描述',
        dataIndex: 'message'
    },
    {
        title: '时间时间',
        dataIndex: 'event_time'
    },
    {
        title: '集群',
        dataIndex: 'cluster'
    }
])
const tableData = ref([])
const loadTable = ref(true)
const loadSpin = ref(false)

// 获取列表
async function fetchTableList(searchParams = {}) {
    const { size } = query.value
    let params = {
        ...query.value,
        limit: size,
        ...searchParams
    }
    loadTable.value = true
    const res = await apiGetK8sEvents(params)
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    fetchTableList()
}

// 搜索
function handleSearch(params) {
    query.value.page = 1
    fetchTableList(params)
}

const activeKey = ref([1, 2])

onMounted(() => {
    fetchTableList()
})
</script>

<template>
    <a-spin :spinning="loadSpin">
        <a-collapse v-model:activeKey="activeKey" ghost>
            <a-collapse-panel key="1" header="概览" style="font-size: 18px">
                <!-- 平台信息 -->
                <PlatformInfo />
                <!-- 集群资源信息 -->
                <Resource v-model="loadSpin" />
            </a-collapse-panel>

            <a-collapse-panel key="2" header="事件" style="font-size: 18px">
                <!-- 搜索框 -->
                <SearchForm @search="handleSearch" />
                <!-- 表格 -->
                <a-card :bodyStyle="{ padding: '10px' }">
                    <a-table
                        :columns="tableColumns"
                        :data-source="tableData"
                        :loading="loadTable"
                        :pagination="false"
                        style="font-size: 12px"
                    >
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.dataIndex === 'name'">
                                <a style="color: rgb(84, 138, 238); font-weight: bold">{{ record.name }}</a>
                            </template>
                            <template v-if="column.dataIndex === 'event_time'">
                                <span> {{ timeTrans(record.event_time) }}</span>
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
            </a-collapse-panel>
        </a-collapse>
    </a-spin>
</template>

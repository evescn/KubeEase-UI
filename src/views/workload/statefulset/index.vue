<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiDelStatefulSet, apiGetStatefulSetDetail, apiGetStatefulSetsList, apiUpdateStatefulSet } from '@/api/kube/kube'
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
        title: 'StatefulSet名',
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
const statefulsetList = ref([])
const appLoading = ref(false)

async function getStatefulSetList() {
    appLoading.value = true
    const { size } = query.value
    let params = {
        ...query.value,
        limit: size
    }
    const res = await apiGetStatefulSetsList(params)
    statefulsetList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getStatefulSetList()
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

async function getStatefulSetDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        sts_name: val.metadata.name
    }

    const res = await apiGetStatefulSetDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updateStatefulSet() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdateStatefulSet(params)
        message.success(res.msg)
        getStatefulSetList()
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

async function delStatefulSet(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        sts_name: name
    }

    const res = await apiDelStatefulSet(params)
    message.success(res.msg)
    getStatefulSetList()
}
</script>

<template>
    <MainHead
        namespace
        searchDescribe="请输入"
        @dataList="getStatefulSetList"
        @namespaceChange="getNamespaceValue"
        @searchChange="getSearchValue"
    />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table
            :columns="columns"
            :dataSource="statefulsetList"
            :loading="appLoading"
            :pagination="false"
            style="font-size: 12px"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <span style="font-weight: bold">{{ record.metadata.name }}</span>
                </template>
                <template v-if="column.dataIndex === 'labels'">
                    <div v-for="(val, key) in record.spec.template.metadata.labels" :key="key">
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
                </template>
                <template v-if="column.key === 'action'">
                    <c-button class="statefulset-button" icon="form-outlined" type="primary" @click="getStatefulSetDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="statefulset-button"
                        icon="delete-outlined"
                        style="margin-bottom: 5px"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delStatefulSet)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="statefulsetList?.length || 0"
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

    <ModalYaml v-model="yamlModelData" @update="updateStatefulSet" />
</template>

<style scoped>
.statefulset-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/stores'
import { apiDelSecret, apiGetSecretDetail, apiGetSecretsList, apiUpdateSecret } from '@/api/kube/kube'
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
        title: 'Secret名',
        dataIndex: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels'
    },
    {
        title: 'DATA',
        dataIndex: 'data'
    },
    {
        title: '类型',
        dataIndex: 'type'
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
const secretList = ref([])
const appLoading = ref(false)

async function getSecretList() {
    appLoading.value = true
    const { size } = query.value
    let params = {
        ...query.value,
        limit: size
    }
    const res = await apiGetSecretsList(params)
    secretList.value = res.data.items || []
    appLoading.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getSecretList()
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

async function getSecretDetail(val) {
    let params = {
        namespace: serviceStore.service.namespace,
        cluster: serviceStore.service.k8s_cluster,
        secret_name: val.metadata.name
    }

    const res = await apiGetSecretDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
    yamlModelData.value.appLoading = false
}

async function updateSecret() {
    yamlModelData.value.appLoading = true
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        content: JSON.stringify(transObj(yamlModelData.value.contentYaml))
    }
    try {
        const res = await apiUpdateSecret(params)
        message.success(res.msg)
        getSecretList()
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

async function delSecret(name) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace: serviceStore.service.namespace,
        secret_name: name
    }

    const res = await apiDelSecret(params)
    message.success(res.msg)
    getSecretList()
}
</script>

<template>
    <MainHead namespace @dataList="getSecretList" @namespaceChange="getNamespaceValue" @searchChange="getSearchValue" />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="columns" :dataSource="secretList" :loading="appLoading" :pagination="false" style="font-size: 12px">
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
                <template v-if="column.dataIndex === 'data'">
                    <a-popover :overlayStyle="{ width: '520px' }">
                        <template #content>
                            <div style="width: 500px; height: 300px; word-break: break-all; overflow-y: auto">
                                {{ record.data }}
                            </div>
                        </template>
                        <file-text-outlined style="font-size: 15px" />
                    </a-popover>
                </template>
                <template v-if="column.dataIndex === 'type'">
                    <span style="color: rgb(84, 138, 238); font-weight: bold">{{ record.type }} </span>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <c-button
                        class="secret-button"
                        icon="form-outlined"
                        style="margin-bottom: 5px"
                        type="primary"
                        @click="getSecretDetail(record)"
                        >YML
                    </c-button>
                    <c-button
                        class="secret-button"
                        icon="delete-outlined"
                        type="error"
                        @click="showConfirm('删除', record.metadata.name, delSecret)"
                        >删除
                    </c-button>
                </template>
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="secretList?.length || 0"
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

    <ModalYaml v-model="yamlModelData" @update="updateSecret" />
</template>

<style scoped>
.secret-button {
    margin-right: 5px;
}

.ant-form-item {
    margin-bottom: 20px;
}
</style>

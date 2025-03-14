<script setup>
import { ref } from 'vue'
import { showConfirm } from '@/utils/modal'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

const formData = defineModel({
    type: Object
})

const emit = defineEmits(['create'])

const formRef = ref()

//关闭抽屉
function onClose() {
    showConfirm('关闭', '', close)
}

function close() {
    formRef.value.resetFields()
}

const formSubmit = async () => {
    await formRef.value.validateFields()
    emit('create')
}
</script>

<template>
    <!-- 创建ingress的抽屉弹框 -->
    <a-drawer v-model:visible="formData.createDrawer" :footer-style="{ textAlign: 'right' }" title="创建Ingress" @close="onClose">
        <br />
        <a-form ref="formRef" :labelCol="{ style: { width: '33%' } }" :model="formData.createSvc">
            <a-form-item :rules="[{ required: true, message: '请输入Ingress名称' }]" label="名称" name="name">
                <a-input v-model:value="formData.createSvc.name" />
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请选择命名空间' }]" label="命名空间" name="namespace">
                <a-select v-model:value="formData.createSvc.namespace" placeholder="请选择" show-search style="width: 140px">
                    <a-select-option
                        v-for="(item, index) in serviceStore.service.namespaceList"
                        :key="index"
                        :value="item.metadata.name"
                    >
                        {{ item.metadata.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请输入标签' }]" label="标签" name="createLabelStr">
                <a-input v-model:value="formData.createSvc.createLabelStr" placeholder="project=ms,app=gateway" />
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请输入类型' }]" label="类型" name="type">
                <a-input v-model:value="formData.createSvc.type" />
            </a-form-item>
            <a-form-item
                :rules="[{ required: true, message: '请输入container端口' }]"
                label="Container端口"
                name="container_port"
            >
                <a-input v-model:value="formData.createSvc.container_port" />
            </a-form-item>

            <a-form-item :rules="[{ required: true, message: '请输入service端口' }]" label="Service端口" name="port">
                <a-input v-model:value="formData.createSvc.port" />
            </a-form-item>

            <a-form-item label="NodePort端口" name="node_port">
                <a-input v-model:value="formData.createSvc.node_port" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button style="margin-right: 8px" @click="onClose()">取消</a-button>
            <a-button type="primary" @click="formSubmit()">创建</a-button>
        </template>
    </a-drawer>
</template>

<style scoped></style>

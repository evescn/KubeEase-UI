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
    <!-- 创建deployment的抽屉弹框 -->
    <a-drawer
        v-model:visible="formData.createDrawer"
        :footer-style="{ textAlign: 'right' }"
        title="创建 Deployment"
        @close="onClose"
    >
        <br />
        <a-form ref="formRef" :labelCol="{ style: { width: '30%' } }" :model="formData.createDeployment">
            <a-form-item :rules="[{ required: true, message: '请输入Deployment名称' }]" label="名称" name="name">
                <a-input v-model:value="formData.createDeployment.name" />
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请选择命名空间' }]" label="命名空间" name="namespace">
                <a-select
                    v-model:value="formData.createDeployment.namespace"
                    placeholder="请选择"
                    show-search
                    style="width: 140px"
                >
                    <a-select-option
                        v-for="(item, index) in serviceStore.service.namespaceList"
                        :key="index"
                        :value="item.metadata.name"
                    >
                        {{ item.metadata.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="副本数" name="replicas">
                <a-input-number v-model:value="formData.createDeployment.replicas" :max="30" :min="1"></a-input-number>
                <a-popover>
                    <template #content>
                        <span>Deployment副本数最小1，最大30</span>
                    </template>
                    <info-circle-outlined style="margin-left: 10px; color: rgb(84, 138, 238)" />
                </a-popover>
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请输入镜像名' }]" label="镜像" name="image">
                <a-input v-model:value="formData.createDeployment.image" />
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请输入标签' }]" label="标签" name="createLabelStr">
                <a-input v-model:value="formData.createDeployment.createLabelStr" placeholder="project=ms,app=gateway" />
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请选择资源规格' }]" label="资源配额" name="createResource">
                <a-select
                    v-model:value="formData.createDeployment.createResource"
                    placeholder="请选择"
                    show-search
                    style="width: 140px"
                >
                    <a-select-option value="0.5/1">0.5核/1G</a-select-option>
                    <a-select-option value="1/2">1核/2G</a-select-option>
                    <a-select-option value="2/4">2核/4G</a-select-option>
                    <a-select-option value="4/8">4核/8G</a-select-option>
                    <a-select-option value="8/16">8核/16G</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item :rules="[{ required: true, message: '请输入端口号' }]" label="容器端口" name="container_port">
                <a-input v-model:value="formData.createDeployment.container_port" />
            </a-form-item>
            <a-form-item label="健康检查" name="health_check">
                <a-switch v-model:checked="formData.createDeployment.health_check" />
            </a-form-item>
            <a-form-item
                v-if="formData.createDeployment.health_check"
                :rules="[{ required: true, message: '请输入健康检测路径' }]"
                label="检测路径"
                name="health_path"
            >
                <a-input v-model:value="formData.createDeployment.health_path" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button style="margin-right: 8px" @click="onClose()">取消</a-button>
            <a-button type="primary" @click="formSubmit()">创建</a-button>
        </template>
    </a-drawer>
</template>

<style scoped></style>

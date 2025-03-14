<script setup>
import common from '@/config'

const formData = defineModel({
    type: Object
})

const emit = defineEmits(['update'])

const cmOptions = common.cmOptions

const updateData = () => {
    emit('update', formData.value)
}
</script>

<template>
    <!-- 展示YAML信息的弹框 -->
    <!--:confirm-loading="appLoading"-->
    <div v-if="formData.isView">
        <a-modal
            v-model:visible="formData.yamlModel"
            :cancel-button-props="{ disabled: true }"
            :confirm-loading="formData.appLoading"
            :ok-button-props="{ disabled: true }"
            cancelText="取消"
            okText="更新"
            title="YAML信息"
            width="945px"
        >
            <!-- codemirror 编辑器 -->
            <codemirror
                v-model:value="formData.contentYaml"
                :options="cmOptions"
                border
                height="800"
                style="font-size: 14px"
                width="900"
                @change="onChange"
            >
            </codemirror>
        </a-modal>
    </div>
    <div v-else>
        <a-modal
            v-model:visible="formData.yamlModel"
            :confirm-loading="formData.appLoading"
            cancelText="取消"
            okText="更新"
            title="YAML信息"
            width="945px"
            @ok="updateData"
        >
            <!-- codemirror 编辑器 -->
            <codemirror
                v-model:value="formData.contentYaml"
                :options="cmOptions"
                border
                height="800"
                style="font-size: 14px"
                width="900"
                @change="onChange"
            >
            </codemirror>
        </a-modal>
    </div>
</template>

<style lang="less" scoped></style>

<script setup>
import common from '@/config'

const formData = defineModel({
    type: Object
})

const emit = defineEmits(['update'])

const cmOptions = common.cmOptions

const updateNamespace = () => {
    emit('update')
}
</script>

<template>
    <!-- 展示YAML信息的弹框 -->
    <!--:confirm-loading="appLoading"-->
    <a-modal
        v-model:visible="formData.yamlModel"
        :confirm-loading="formData.appLoading"
        cancelText="取消"
        okText="更新"
        title="YAML信息"
        width="945px"
        @ok="updateNamespace"
    >
        <!-- codemirror 编辑器 -->
        <codemirror
            :options="cmOptions"
            :value="formData.contentYaml"
            border
            height="800"
            style="font-size: 14px"
            width="900"
            @change="onChange"
        >
        </codemirror>
    </a-modal>
</template>

<style lang="less" scoped></style>

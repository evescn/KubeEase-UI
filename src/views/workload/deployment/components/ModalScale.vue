<script setup>
const formData = defineModel({
    type: Object
})

const emit = defineEmits(['scale'])

const scaleDeployment = () => {
    emit('scale')
}
</script>

<template>
    <!-- 调整副本数的弹框 -->
    <a-modal
        v-model:visible="formData.scaleModel"
        :confirm-loading="formData.appLoading"
        cancelText="取消"
        okText="更新"
        title="副本数调整"
        @ok="scaleDeployment"
    >
        <div style="text-align: center">
            <span style="margin-right: 30px">实例数: </span>
            <a-input-number v-model:value="formData.scaleNum" :max="30" :min="0" label="描述文字"></a-input-number>
            <a-popover>
                <template #content>
                    <span>Deployment实例数最小0，最大30</span>
                </template>
                <info-circle-outlined style="margin-left: 10px; color: rgb(84, 138, 238)" />
            </a-popover>
        </div>
    </a-modal>
</template>

<style scoped></style>

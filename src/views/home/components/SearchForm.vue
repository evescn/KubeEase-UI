<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])

const formParams = ref({})

function onSearch() {
    emit('search', formParams.value)
}

function onReset() {
    resetFormParams()
    emit('search', formParams.value)
}

function resetFormParams() {
    formParams.value = {}
}
</script>

<template>
    <div style="text-align: right; margin-bottom: 10px">
        <a-input-search
            v-model:value="formParams.name"
            allow-clear
            placeholder="请输入资源名"
            style="width: 400px"
            @clear="onReset"
            @search="onSearch"
            @press-enter="onSearch"
        ></a-input-search>
    </div>
</template>

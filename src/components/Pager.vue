<script lang="ts" setup>
import { computed, onMounted, reactive, watch } from 'vue'

const props = defineProps<{
    length: number
    loading: boolean
    pageNum: number
    pageSize: number
}>()
const emit = defineEmits(['change'])

const state = reactive<{
    page: number
    size: number
    pager: number[]
}>({
    page: 1,
    size: 10,
    pager: [1]
})

const disabledPrev = computed(() => state.page <= 1)
const disabledNext = computed(() => !props.length || state.size > props.length)

watch(
    () => props.length,
    () => {
        _composePager()
    }
)
watch(
    () => state.page,
    () => {
        _composePager()
    }
)
watch(
    () => props.pageNum,
    (val) => {
        state.page = val
    }
)
watch(
    () => props.pageSize,
    (val) => {
        state.size = val
    }
)

function onPrev() {
    state.page -= 1
    _notify()
}

function onNext() {
    state.page += 1
    _notify()
}

function onCurrent(num: number) {
    if (num === state.page) {
        return
    }
    state.page = num
    _notify()
}

function _composePager() {
    state.pager = []
    let start = 1
    let end = state.page
    if (!disabledNext.value) {
        end += 1
    }

    // 限制长度5
    if (end - start >= 4) {
        start = end - 4
    }

    for (let i = start; i <= end; i++) {
        state.pager.push(i)
    }
}

const sizeNumbers = [10, 30, 50, 100]
const onChangeSize = (size: any) => {
    state.page = 1
    state.size = size as number
    _notify()
}

function _notify() {
    emit('change', { page: state.page, size: state.size })
}

onMounted(() => {
    state.page = props.pageNum
    state.size = props.pageSize
})
</script>
<template>
    <div class="dx-pager">
        <a-space>
            <!-- 偏移量 -->
            <a-select v-model:value="state.size" @change="onChangeSize">
                <a-select-option v-for="num in sizeNumbers" :key="num" :value="num">{{ num }} 条/页</a-select-option>
            </a-select>
            <!-- 首页 -->
            <a-button :disabled="state.page === 1 || loading" @click="() => onCurrent(1)">首页</a-button>
            <!-- 上一页 -->
            <a-button :disabled="disabledPrev || loading" @click="onPrev">上一页</a-button>

            <!-- 分页器 -->
            <a-button v-for="num in state.pager" :key="num" :disabled="loading" :type="state.page === num ? 'primary' : 'secondary'" class="ml-5" @click="() => onCurrent(num)">
                {{ num }}
            </a-button>

            <!-- 下一页 -->
            <a-button :disabled="disabledNext || loading" @click="onNext"> 下一页</a-button>
        </a-space>
    </div>
</template>
<style lang="less" scoped>
.dx-pager {
    display: flex;
    width: 100%;
    justify-content: flex-end;
}
</style>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import common, { wsHost } from '@/config'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { apiGetPodContainer } from '@/api/kube/kube'

const appLoading = ref(false)
const router = useRouter()

// 容器列表
const containerValue = ref()
const containerList = ref([])

// 终端
const termOptions = common.termOptions
var term = null
var socket = null

// 获取容器列表
async function getContainerList() {
    let query = router.currentRoute.value.query
    let params = {
        pod_name: query.pod_name,
        namespace: query.namespace,
        cluster: query.cluster
    }
    const res = await apiGetPodContainer(params)
    containerList.value = res.data
    containerValue.value = res.data[0]
}

//初始化虚拟终端
function initTerm() {
    term = new Terminal(termOptions)
    term.open(document.getElementById('xterm'))
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()
    term.focus()
    term.onData(function (key) {
        let msgOrder = {
            operation: 'stdin',
            data: key
        }
        socket.send(JSON.stringify(msgOrder))
    })
    let msgOrder2 = {
        operation: 'resize',
        cols: term.cols,
        rows: term.rows
    }
    socket.send(JSON.stringify(msgOrder2))
}

//初始化websocket
const initSocket = () => {
    if (term) {
        term.dispose()
    }
    if (socket) {
        socket.close()
    }
    let query = router.currentRoute.value.query
    let terminalWsUrl = wsHost + '/ws' + '?pod_name=' + query.pod_name + '&container_name=' + containerValue.value + '&namespace=' + query.namespace + '&cluster=' + query.cluster
    socket = new WebSocket(terminalWsUrl)
    socket.onopen = () => {
        // 链接成功后
        initTerm()
    }
    socket.onmessage = (msg) => {
        let content = JSON.parse(msg.data)
        term.write(content.data)
    }
    socket.onsend = (msgOrder) => {
        let order = []
        order.push(msgOrder)
        socket.send(JSON.stringify(order))
    }
    socket.onclose = () => {
        console.log('close socket')
    }
    socket.onerror = () => {
        console.log('socket 连接失败')
    }
}
const closeSocket = () => {
    if (!socket) {
        return
    }
    term.write('连接关闭')
    socket.close()
}

//生命周期钩子
onBeforeUnmount(() => {
    if (socket) {
        socket.close()
    }
})
onMounted(() => {
    getContainerList()
    // initSocket()
})
</script>

<template>
    <div>
        <div style="height: 10px"></div>
        <a-card :bodyStyle="{ padding: '10px', height: '45px' }">
            <span style="font-size: 14px">容器: </span>
            <a-select v-model:value="containerValue" placeholder="请选择" size="small" style="width: 140px">
                <a-select-option v-for="(item, index) in containerList" :key="index" :value="item">
                    {{ item }}
                </a-select-option>
            </a-select>
            <a-button ghost size="small" style="margin-left: 20px" type="primary" @click="initSocket()">
                <template #icon>
                    <LoginOutlined />
                </template>
                连接
            </a-button>
            <a-button ghost size="small" style="margin-left: 10px" type="danger" @click="closeSocket()">
                <template #icon>
                    <DisconnectOutlined />
                </template>
                关闭
            </a-button>
        </a-card>
        <a-card :bodyStyle="{ padding: '0px', height: '100%' }" :loading="appLoading" class="term-card">
            <div id="xterm" class="xterm-div"></div>
        </a-card>
    </div>
</template>

<style scoped>
.term-card {
    margin-top: 10px;
    height: calc(100vh - 67px);
}

.term-card::-webkit-scrollbar {
    width: 10px;
}

.term-card::-webkit-scrollbar-thumb {
    background-color: #666;
}

.term-card::-webkit-scrollbar-track {
    background-color: rgb(164, 162, 162);
}

.xterm-div {
    height: 100%;
    background-color: black;
}

/deep/ .xterm-viewport::-webkit-scrollbar {
    width: 10px;
}

/deep/ .xterm-viewport::-webkit-scrollbar-thumb {
    background-color: #666;
}

/deep/ .xterm-viewport::-webkit-scrollbar-track {
    background-color: rgb(164, 162, 162);
}
</style>

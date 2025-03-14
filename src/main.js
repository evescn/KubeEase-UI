import { createApp } from 'vue'
import App from './App.vue'

// 导入 ant design 组件和 css
import Antd from 'ant-design-vue'
// 暗黑色主题风格
import 'ant-design-vue/dist/antd.dark.css'
import * as Icons from '@ant-design/icons-vue'

import router from './router'
import pinia from '@/stores/index'
import { useServiceStore } from '@/stores'

// 导入 自定义 button
import CButton from '@/components/CButton/index.vue'
import MainHead from '@/components/MainHead/index.vue'
import ModalYaml from '@/components/Model/index.vue'
import time from '@/utils/time'

// codemirror编辑器
import { GlobalCmComponent } from 'codemirror-editor-vue3'
// 引入主题 可以从 codemirror/theme/ 下引入多个
import 'codemirror/theme/dracula.css'
// 引入语言模式 可以从 codemirror/mode/ 下引入多个
import 'codemirror/mode/yaml/yaml.js'

const app = createApp(App)
// 图标注册全局组件
for (const i in Icons) {
    app.component(i, Icons[i])
}

//自定义button 注册
app.component('c-button', CButton)
app.component('MainHead', MainHead)
app.component('ModalYaml', ModalYaml)

const initGlobalData = async () => {
    const serviceStore = useServiceStore()
    // 获取 service 数据
    serviceStore.getServiceInfo()
}

app.use(time).use(GlobalCmComponent, { componentName: 'codemirror' }).use(Antd).use(pinia).use(router).mount('#app')

initGlobalData()

export const rbacHost = import.meta.env.VITE_APP_RbacHost
export const baseHost = import.meta.env.VITE_APP_BaseHost
export const wsHost = import.meta.env.VITE_APP_WsHost

export default {
    //编辑器配置
    cmOptions: {
        // 语言及语法模式
        mode: 'text/yaml',
        // 主题
        theme: 'dracula',
        // 显示行数
        lineNumbers: true,
        smartIndent: true, //智能缩进
        indentUnit: 4, // 智能缩进单元长度为 4 个空格
        styleActiveLine: true, // 显示选中行的样式
        matchBrackets: true, //每当光标位于匹配的方括号旁边时，都会使其高亮显示
        readOnly: false,
        lineWrapping: true //自动换行
    },
    //xterm终端配置
    termOptions: {
        rendererType: 'canvas', //渲染类型
        rows: 40, //行数
        cols: 100,
        convertEol: false, //启用时，光标将设置为下一行的开头
        scrollback: 10, //终端中的回滚量
        disableStdin: false, //是否应禁用输入
        cursorStyle: 'underline', //光标样式
        cursorBlink: true, //光标闪烁
        theme: {
            foreground: 'white', //字体
            background: '#060101', //背景色
            cursor: 'help' //设置光标
        }
    }
}

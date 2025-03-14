export default {
    install(app) {
        // 数据库时间调整
        app.config.globalProperties.timeTrans = function (date) {
            date = date.substring(0, 19).replace('T', ' ')
            date = date.substring(0, 19).replace('+08:00', '')
            return date
        }
        // 容器时间调整
        app.config.globalProperties.timeDockerTrans = function (timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON()
            date = date.substring(0, 19).replace('T', ' ')
            return date
        }
    }
}

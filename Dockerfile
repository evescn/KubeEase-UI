# 使用 NGINX Alpine 镜像来运行前端应用
FROM nginx:alpine

# 复制构建好的前端应用到 NGINX 默认静态文件目录
COPY ./dist /data/w/kube-ease-ui
COPY ./kube-ease-ui.conf /etc/nginx/conf.d/

# 暴露 HTTP 端口
EXPOSE 80

# 启动 NGINX
CMD ["nginx", "-g", "daemon off;"]
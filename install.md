# KubeEase-UI

> k8s 管理平台前端

## 1. 服务镜像打包

### 克隆代码

```shell
$ git clone https://github.com/evescn/KubeEase-UI.git
$ cd KubeEase-UI
$ git checkout master
```

### 打包镜像

> 方法1 打包 Docker 镜像

```shell
# 打包服务
$ rm ./dist -rf
$ npm run build:prod

# 打包 Docker 镜像
$ docker build -t harbor.xxx.cn/devops/kube-ease-ui:v1.1 .
$ docker push harbor.xxx.cn/devops/kube-ease-ui:v1.1
```

> 方法2 打包 Docker 镜像

```shell
$ chmod a+x ./build.sh
$ ./build 1 dev # 版本号信息 环境
```

## 2. 服务部署

### a | Docker 启动

```shell
$ docker run -d \
  --restart=always \
  --name kube-ease-ui \
  -p 80:80 \
  harbor.xxx.cn/devops/kube-ease-ui:v1.1
```

### b | Kubernetes 启动

```yaml
# k8s.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-ease-ui
  namespace: devops
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kube-ease-ui
  template:
    metadata:
      labels:
        app: kube-ease-ui
    spec:
      containers:
        - name: kube-ease-ui
          image: harbor.xxx.cn/devops/kube-ease-ui:v1.1
          imagePullPolicy: Always
          ports:
            - containerPort: 80

---
# service
apiVersion: v1
kind: Service
metadata:
  name: kube-ease-ui
  namespace: devops
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 80
      nodePort: 27080
  selector:
    app: kube-ease-ui
  type: NodePort

---
# ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kube-ease
  namespace: devops
spec:
  ingressClassName: nginx
  rules:
    - host: kube-ease.xxx.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kube-ease-ui
                port:
                  number: 80
```

```shell
$ kubectl apply -f k8s.yaml
```

## 3. 服务访问

> 项目前后端分离，需要部署后端后才能访问
> [后端地址](https://github.com/evescn/KubeEase)

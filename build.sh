#!/bin/bash

## 打包服务
rm -rf ./dist
pnpm run build:$2

## 打包镜像
docker build -t harbor.xxx.com/devops/kube-ease-ui:v1.$1 .
docker push harbor.xxx.com/devops/kube-ease-ui:v1.$1

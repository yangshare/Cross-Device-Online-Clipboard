# 使用轻量级的 Node.js 18 Alpine 镜像
FROM node:18-alpine

# 添加元数据
LABEL maintainer="yangshare"
LABEL description="Cross-device online clipboard"


# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 安装生产环境依赖
RUN npm install --production

# 复制项目源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]

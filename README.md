# 📋 Cross-Device Online Clipboard (跨屏即时剪贴板)

一个极简的 Web 端跨设备文本传输工具。无需下载 App，无需登录，只需扫码即可在手机和电脑之间实时同步文本。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14-green.svg)

## 📸 界面预览

<p align="center">
  <img src="docs/image.png" alt="Project Screenshot" width="800">
</p>

> 试用地址：https://copy.yangshare.cn

## ✨ 功能特性

*   **即扫即用**：PC 端生成动态二维码，手机扫码即连。
*   **私有频道**：基于 Socket.io 的 Room 机制，确保每对连接的数据隔离。
*   **实时同步**：WebSocket 长连接，毫秒级传输延迟。
*   **智能识别**：自动识别局域网 IP / 公网域名，支持 Docker 及反向代理部署。
*   **历史记录**：PC 端自动保存接收历史，支持一键复制。
*   **剪贴板兼容**：智能降级策略，支持 HTTPS 下的 Clipboard API 和 HTTP 下的传统复制。

## 🛠️ 本地开发

确保您的环境已安装 Node.js (v14+)。

1.  **克隆项目**
    ```bash
    git clone https://github.com/yangshare/Cross-Device-Online-Clipboard.git
    cd online-clipboard
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动服务**
    ```bash
    npm start
    ```

4.  **访问**
    浏览器打开控制台输出的地址（通常是 `http://localhost:3000` 或 `http://<局域网IP>:3000`）。

## 🐳 Docker 部署

提供多种 Docker 部署方式，任选其一。

### 方式一：直接使用 Docker 镜像 (推荐)

无需下载代码，直接拉取 Docker Hub 镜像运行：

```bash
docker run -d -p 3000:3000 --name online-clipboard yangshare/online-clipboard
```

### 方式二：Docker Compose (源码部署)

如果您已下载本项目代码，可以直接使用 Docker Compose 启动：

1.  确保已安装 Docker 和 Docker Compose。
2.  在项目根目录下运行：
    ```bash
    docker-compose up -d
    ```
3.  服务将在 `3000` 端口启动。

### 方式三：手动构建镜像

如果您想手动控制构建过程：

1.  **构建镜像**
    ```bash
    docker build -t online-clipboard .
    ```

2.  **运行容器**
    ```bash
    docker run -d -p 3000:3000 --name my-clipboard online-clipboard
    ```

## 🌐 公网/反向代理部署说明

本项目支持部署在公网服务器（如 VPS），建议配合 Nginx 使用。

**Nginx 配置示例**：
由于使用了 WebSocket，需要配置 Upgrade 头。

```nginx
server {
    listen 80;
    server_name clipboard.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme; # 关键：识别 https
    }
}
```

## ⚠️ 注意事项

1.  **局域网使用**：手机和电脑必须在同一局域网（Wi-Fi），或者服务器有公网 IP。
2.  **复制功能**：
    *   在 **HTTPS** 或 **localhost** 环境下，使用现代 Clipboard API，体验最佳。
    *   在 **HTTP (非 localhost)** 环境下（如直接访问局域网 IP），系统会自动降级使用 `execCommand` 模拟复制，确保功能可用。

## 📄 License

Apache-2.0 license

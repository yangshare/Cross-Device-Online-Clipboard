const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 获取所有本机 IPv4 地址
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({ name, address: iface.address });
            }
        }
    }
    return ips;
}

// 智能选择最佳局域网IP
function getBestIP() {
    const ips = getLocalIPs();
    if (ips.length === 0) return 'localhost';

    // 优先级策略：192.168.x.x > 10.x.x.x > 172.x.x.x > 其他
    const ip192 = ips.find(ip => ip.address.startsWith('192.168.'));
    if (ip192) return ip192.address;

    const ip10 = ips.find(ip => ip.address.startsWith('10.'));
    if (ip10) return ip10.address;

    const ip172 = ips.find(ip => ip.address.startsWith('172.'));
    if (ip172) return ip172.address;

    return ips[0].address;
}

const PORT = 3000;
const HOST_IP = getBestIP();

app.use(express.static(path.join(__dirname, 'public')));

// Socket.io 逻辑
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 识别客户端类型
    socket.on('register_pc', async () => {
        // 智能识别客户端访问的 Host 和协议
        // 优先使用 headers 中的 host，适配域名/反向代理/局域网 IP 等各种场景
        const clientHost = socket.handshake.headers.host;
        
        // 判断是否通过 https 访问 (反向代理通常会设置 x-forwarded-proto)
        const proto = socket.handshake.headers['x-forwarded-proto'] || 'http';
        
        const mobileUrl = `${proto}://${clientHost}/mobile.html?id=${socket.id}`;
        
        console.log(`[New Session] PC registered. URL: ${mobileUrl}`);

        try {
            const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl);
            socket.emit('pc_init', {
                sessionId: socket.id,
                qrCode: qrCodeDataUrl,
                url: mobileUrl
            });
            socket.join(socket.id); // 加入以自己ID命名的房间
        } catch (err) {
            console.error('QR Code generation error:', err);
        }
    });

    socket.on('send_text', (data) => {
        const { targetId, content } = data;
        if (targetId && content) {
            // 发送给指定的 PC
            io.to(targetId).emit('receive_text', {
                content,
                timestamp: new Date().toLocaleTimeString()
            });
            // 确认发送成功
            socket.emit('send_success');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://${HOST_IP}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    
    // 打印所有可用IP，方便调试
    const ips = getLocalIPs();
    if (ips.length > 1) {
        console.log('\nAvailable Network Interfaces:');
        ips.forEach(ip => {
            console.log(`- ${ip.name}: http://${ip.address}:${PORT}`);
        });
    }
});

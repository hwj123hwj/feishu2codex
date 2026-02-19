import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isApiRequestAuthorized } from './policies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 Express 应用
const app = express();
const PORT = process.env.WEB_PORT || 3000;
const HOST = process.env.WEB_HOST || '127.0.0.1';
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const WEB_PUBLIC_DIR = path.join(__dirname, '../web/public');
const WEB_SRC_DIR = path.join(__dirname, '../web/src');

app.use(cors({
    origin: false
}));
app.use(express.json());

// 静态文件服务
if (fs.existsSync(WEB_PUBLIC_DIR)) {
    app.use(express.static(WEB_PUBLIC_DIR));
}
if (fs.existsSync(WEB_SRC_DIR)) {
    app.use('/src', express.static(WEB_SRC_DIR));
}
if (!fs.existsSync(WEB_PUBLIC_DIR)) {
    app.get('/', (req, res) => {
        res.type('text/plain').send('Web console assets are not present in this build.');
    });
}

app.use('/api', (req, res, next) => {
    if (isApiRequestAuthorized(req.header('authorization'), WEB_API_TOKEN, req.ip)) {
        next();
        return;
    }
    res.status(401).json({ error: 'Unauthorized' });
});

// 全局状态
let globalStats = {
    status: 'running',
    sessions: 0,
    messages: 0,
    uptime: 0,
    startTime: Date.now()
};

let globalLogs: Array<{timestamp: number, level: string, message: string}> = [];
const MAX_LOGS = 500;

// API 路由
app.get('/api/stats', (req, res) => {
    globalStats.uptime = Math.floor((Date.now() - globalStats.startTime) / 1000);
    res.json(globalStats);
});

app.get('/api/logs', (req, res) => {
    res.json(globalLogs);
});

// 导出函数供机器人调用
export function updateStats(updates: Partial<typeof globalStats>) {
    Object.assign(globalStats, updates);
}

export function addLog(level: string, message: string) {
    globalLogs.push({
        timestamp: Date.now(),
        level,
        message
    });

    // 限制日志数量
    if (globalLogs.length > MAX_LOGS) {
        globalLogs = globalLogs.slice(-MAX_LOGS);
    }
}

export function startWebServer() {
    app.listen(PORT, HOST, () => {
        console.log(`[Web控制台] 已启动，访问 http://${HOST}:${PORT}`);
        addLog('info', `Web控制台已启动，端口: ${PORT}`);
    });
}

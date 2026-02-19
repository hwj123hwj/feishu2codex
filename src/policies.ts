type LoggerLevel = 'debug' | 'info' | 'warn' | 'error';

export function parseLoggerLevel(rawLevel: string | undefined): LoggerLevel {
    const level = (rawLevel || '').toLowerCase();
    if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
        return level;
    }
    return 'info';
}

export function isBotMentioned(mentions: unknown, botOpenId: string | undefined): boolean {
    if (!botOpenId || !Array.isArray(mentions) || mentions.length === 0) {
        return false;
    }

    for (const mention of mentions) {
        const openId = (mention as any)?.id?.open_id;
        if (typeof openId === 'string' && openId === botOpenId) {
            return true;
        }
    }
    return false;
}

function isLoopbackIp(ip: string | undefined): boolean {
    if (!ip) return false;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

export function isApiRequestAuthorized(
    authorizationHeader: string | undefined,
    apiToken: string | undefined,
    requestIp: string | undefined
): boolean {
    if (apiToken && apiToken.length > 0) {
        return authorizationHeader === `Bearer ${apiToken}`;
    }
    return isLoopbackIp(requestIp);
}

export function sanitizeErrorForUser(_error: unknown): string {
    return '处理失败，请稍后重试。';
}

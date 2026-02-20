export async function runWithTimeout<T>(
    task: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        return await Promise.race([
            task(controller.signal),
            new Promise<T>((_, reject) => {
                controller.signal.addEventListener('abort', () => {
                    reject(new Error(`Timeout after ${timeoutMs}ms`));
                });
            })
        ]);
    } finally {
        clearTimeout(timer);
    }
}

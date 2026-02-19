export class ChatRunQueue {
    private tails = new Map<string, Promise<void>>();

    enqueue<T>(chatId: string, task: () => Promise<T>): Promise<T> {
        const previous = this.tails.get(chatId) || Promise.resolve();
        const run = previous.then(task, task);
        const tail = run.then(() => undefined, () => undefined);
        this.tails.set(chatId, tail);

        return run.finally(() => {
            if (this.tails.get(chatId) === tail) {
                this.tails.delete(chatId);
            }
        });
    }
}

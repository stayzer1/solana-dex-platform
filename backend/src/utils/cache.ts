class Cache {
    private store: Map<string, { data: any; expires: number }>;

    constructor() {
        this.store = new Map();
    }

    set(key: string, data: any, ttl: number) {
        this.store.set(key, {
            data,
            expires: Date.now() + ttl,
        });
    }

    get(key: string) {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.expires) {
            this.store.delete(key);
            return null;
        }

        return item.data;
    }
}

export const cache = new Cache();

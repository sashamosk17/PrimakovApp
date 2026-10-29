import { RedisCache } from "./RedisCache";

export class CacheManager {
  constructor(private readonly cache: RedisCache) {}

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    const cached = await this.cache.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    const fresh = await fetcher();
    await this.cache.set(key, JSON.stringify(fresh), ttlSeconds);
    return fresh;
  }
}

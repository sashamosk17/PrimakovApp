export class RedisCache {
  async get(_key: string): Promise<string | null> {
    return null;
  }

  async set(_key: string, _value: string, _ttlSeconds?: number): Promise<void> {
    return;
  }
}

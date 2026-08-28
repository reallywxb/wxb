// Map 缓存实现
export class MapCache {
  cache;
  constructor() {
    this.cache = new Map();
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    return this.cache.delete(key);
  }

  entries() {
    return [...this.cache.entries()];
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  set(key, value, ttl = 60_000) {
    this.cache.set(key, value);

    // 设置过期时间
    if (ttl > 0) {
      setTimeout(() => {
        if (this.cache.get(key) === value) {
          this.cache.delete(key);
        }
      }, ttl);
    }
  }

  size() {
    return this.cache.size;
  }
}

// lib/cache.ts
type Entry<V> = { v: V; exp: number };

export class TTLCache<K, V> {
  private map = new Map<K, Entry<V>>();
  constructor(private ttlMs: number) {}

  get(key: K): V | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.exp) {
      this.map.delete(key);
      return undefined;
    }
    return e.v;
  }
  set(key: K, v: V) {
    this.map.set(key, { v, exp: Date.now() + this.ttlMs });
  }
}

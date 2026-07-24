export interface ICacheOperations<T> {
  set(id: string, payload: T): Promise<void>;
  get(id: string): Promise<T | null>;
  del(id: string): Promise<number>;
}

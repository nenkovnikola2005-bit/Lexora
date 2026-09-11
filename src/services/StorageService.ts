import type { IStorageService } from "../models/interfaces";

export class StorageService<T> implements IStorageService<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  get(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      // localStorage unavailable or full — silently ignore
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }
}

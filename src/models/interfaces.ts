import type { RegisterInput, User } from "./User";

export interface IStorageService<T> {
  get(): T | null;
  set(value: T): void;
  remove(): void;
}

export interface IAuthService {
  register(input: RegisterInput): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): void;
  getCurrentUser(): User | null;
  updateUser(id: string, patch: Partial<User>): User | null;
}

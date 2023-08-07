declare global {
  interface ExtendedEnv {
    MODE?: "development" | "production";
  }

  namespace Deno {
    interface Env {
      delete(key: keyof ExtendedEnv): void;
      get<T extends keyof ExtendedEnv>(key: T): ExtendedEnv[T] | undefined;
      has(key: keyof ExtendedEnv): boolean;
      set<T extends keyof ExtendedEnv>(key: T, value: ExtendedEnv[T]): void;
    }
  }
}

export {};

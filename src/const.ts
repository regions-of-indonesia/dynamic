export const __DEV__ = Deno.env.get("MODE") === "development";
export const __PROD__ = Deno.env.get("MODE") === "production";

Deno.env.set("MODE", "development");

console.time("app");
const create = (await import("~/app.ts")).default;
console.timeEnd("app");

const { logger } = await import("hono/middleware.ts");

const app = create((app) => app.use("*", logger()));

import serve from "./serve.ts";

await serve(app);

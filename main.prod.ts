Deno.env.set("MODE", "production");

console.time("app");
const create = (await import("~/app.ts")).default;
console.timeEnd("app");

import serve from "./serve.ts";

await serve(create());

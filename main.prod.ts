Deno.env.set("MODE", "production");

import { serve } from "./main.ts";

await serve();

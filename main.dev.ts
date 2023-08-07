Deno.env.set("MODE", "development");

import { serve } from "./main.ts";

await serve();

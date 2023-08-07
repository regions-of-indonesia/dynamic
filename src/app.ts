import { Hono, HTTPException } from "hono/mod.ts";
import { compress, cors, logger } from "hono/middleware.ts";

import { __DEV__, __PROD__ } from "~/const.ts";
import * as routes from "~/routes.ts";

const app = new Hono();

app.use("*", cors({ origin: "*" }));
app.use("*", compress());

if (__DEV__) {
  console.log("[mode]: development");
  app.use("*", logger());
}
if (__PROD__) {
  console.log("[mode]: production");
}

app.route("/provinces", routes.provinces);
app.route("/districts", routes.districts);
app.route("/subdistricts", routes.subdistricts);
app.route("/villages", routes.villages);
app.route("/region", routes.region);
app.route("/search", routes.search);

app
  .get("/", (ctx) => {
    return ctx.json({ name: "regions-of-indonesia" });
  })
  .notFound((ctx) => {
    return ctx.json({ message: "Not found" }, 404);
  })
  .onError((err, ctx) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    let message = "Internal server error";

    if (err instanceof Error) {
      message = err.message;
    }

    return ctx.json({ message }, 500);
  });

export default app;

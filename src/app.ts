import { Hono, HTTPException } from "hono/mod.ts";
import { compress, cors } from "hono/middleware.ts";

import { __DEV__, __PROD__ } from "~/const.ts";
import * as routes from "~/routes.ts";

const create = (init: (hono: Hono) => Hono = (hono) => hono) => {
  const app = init(new Hono());

  app.use("*", cors({ origin: "*" }));
  app.use("*", compress());
  app.use("*", async (c, next) => {
    await next();
    c.res.headers.set("Cache-Control", "public, max-age=86400");
  });

  app.route("/provinces", routes.provinces);
  app.route("/districts", routes.districts);
  app.route("/subdistricts", routes.subdistricts);
  app.route("/villages", routes.villages);
  app.route("/region", routes.region);
  app.route("/search", routes.search);

  app
    .get("/", (ctx) => ctx.json({ name: "regions-of-indonesia" }))
    .notFound((ctx) => ctx.json({ message: "Not found" }, 404))
    .onError((err, ctx) => {
      if (err instanceof HTTPException) return err.getResponse();
      let message = "Internal server error";
      if (err instanceof Error) message = err.message;
      return ctx.json({ message }, 500);
    });

  return app;
};

export default create;

import type { Hono } from "hono/mod.ts";

const serve = async <T extends Hono>(app: T) => {
  try {
    const port = 8000;
    const hostname = "0.0.0.0";

    const server = Deno.serve(
      {
        port,
        hostname,
        onListen: () => {
          console.log(`[regions-of-indonesia]: ${hostname}:${port}`);
        },
      },
      app.fetch
    );

    await server.finished;

    return server;
  } catch (error) {
    console.error(error);
  }
};

export default serve;

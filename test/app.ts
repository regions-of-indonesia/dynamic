import { assertEquals } from "std/assert/assert_equals.ts";

import { isRegion, isRegions } from "@regions-of-indonesia/utils";

import app from "~/app.ts";

type FetchCallback = (response: Response) => Promise<void>;

const FETCH = {
  GET: (pathname: string, status: number, callback?: FetchCallback) => {
    const input = `${pathname}`;

    Deno.test(`GET ${input}`, async () => {
      const res = await app.request(input, { method: "GET" });
      assertEquals(res.status, status);
      await callback?.(res);
    });
  },
};

const callback = {
  region: (async (response) => assertEquals(isRegion(await response.json()), true)) satisfies FetchCallback,
  regions: (async (response) => assertEquals(isRegions(await response.json()), true)) satisfies FetchCallback,
};

FETCH.GET("/provinces", 200, callback.regions);
FETCH.GET("/provinces/11/districts", 200, callback.regions);
FETCH.GET("/districts/11.01/subdistricts", 200, callback.regions);
FETCH.GET("/subdistricts/11.01.01/villages", 200, callback.regions);

FETCH.GET("/provinces/11", 200, callback.region);
FETCH.GET("/districts/11.01", 200, callback.region);
FETCH.GET("/subdistricts/11.01.01", 200, callback.region);
FETCH.GET("/villages/11.01.01.2001", 200, callback.region);

FETCH.GET("/region/11", 200, callback.region);
FETCH.GET("/region/11.01", 200, callback.region);
FETCH.GET("/region/11.01.01", 200, callback.region);
FETCH.GET("/region/11.01.01.2001", 200, callback.region);

FETCH.GET("/search?name=a", 200, callback.regions);
FETCH.GET("/search/provinces?name=a", 200, callback.regions);
FETCH.GET("/search/districts?name=a", 200, callback.regions);
FETCH.GET("/search/subdistricts?name=a", 200, callback.regions);
FETCH.GET("/search/villages?name=a", 200, callback.regions);

FETCH.GET("/provinces/invalid/districts", 400);
FETCH.GET("/districts/invalid.invalid/subdistricts", 400);
FETCH.GET("/subdistricts/invalid.invalid.invalid/villages", 400);

FETCH.GET("/provinces/invalid", 400);
FETCH.GET("/districts/invalid.invalid", 400);
FETCH.GET("/subdistricts/invalid.invalid.invalid", 400);
FETCH.GET("/villages/invalid.invalid.invalid.invalid", 400);

FETCH.GET("/region/invalid", 400);
FETCH.GET("/region/invalid.invalid", 400);
FETCH.GET("/region/invalid.invalid.invalid", 400);
FETCH.GET("/region/invalid.invalid.invalid.invalid", 400);

FETCH.GET("/provinces/01/districts", 404);
FETCH.GET("/districts/01.01/subdistricts", 404);
FETCH.GET("/subdistricts/01.01.01/villages", 404);

FETCH.GET("/provinces/01", 404);
FETCH.GET("/districts/01.01", 404);
FETCH.GET("/subdistricts/01.01.01", 404);
FETCH.GET("/villages/01.01.01.01", 404);

FETCH.GET("/region/01", 404);
FETCH.GET("/region/01.01", 404);
FETCH.GET("/region/01.01.01", 404);
FETCH.GET("/region/01.01.01.01", 404);

FETCH.GET("/search?name=this-name-should-not-found", 404);
FETCH.GET("/search/provinces?name=this-name-should-not-found", 404);
FETCH.GET("/search/districts?name=this-name-should-not-found", 404);
FETCH.GET("/search/subdistricts?name=this-name-should-not-found", 404);
FETCH.GET("/search/villages?name=this-name-should-not-found", 404);

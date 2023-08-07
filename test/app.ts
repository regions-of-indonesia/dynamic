import { assertEquals } from "std/assert/assert_equals.ts";

import { isRegion, isRegions } from "@regions-of-indonesia/utils";

import app from "~/app.ts";

const json = async (response: Response) => {
  const value = await response.json();

  return {
    message: () => {
      assertEquals(typeof value, "object");
      assertEquals("message" in value, true);
      assertEquals(typeof value.message, "string");
    },
    region: () => {
      assertEquals(isRegion(value), true);
    },
    regions: () => {
      assertEquals(isRegions(value), true);
    },
  };
};

const FETCH = {
  GET: (pathname: string, status: number, callback: (response: Response) => Promise<void>) => {
    const input = `${pathname}`;

    Deno.test(`GET ${input}`, async () => {
      const res = await app.request(input, { method: "GET" });
      assertEquals(res.status, status);
      await callback(res);
    });
  },
};

FETCH.GET("/provinces", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/provinces/11/districts", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/districts/11.01/subdistricts", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/subdistricts/11.01.01/villages", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/provinces/11", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/districts/11.01", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/subdistricts/11.01.01", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/villages/11.01.01.2001", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/region/11", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/region/11.01", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/region/11.01.01", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/region/11.01.01.2001", 200, async (res) => {
  (await json(res)).region();
});

FETCH.GET("/search?name=a", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/search/provinces?name=a", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/search/districts?name=a", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/search/subdistricts?name=a", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/search/villages?name=a", 200, async (res) => {
  (await json(res)).regions();
});

FETCH.GET("/provinces/01/districts", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/districts/01.01/subdistricts", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/subdistricts/01.01.01/villages", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/provinces/01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/districts/01.01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/subdistricts/01.01.01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/villages/01.01.01.2001", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/region/01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/region/01.01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/region/01.01.01", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/region/01.01.01.2001", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/search?name=this-name-should-not-found", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/search/provinces?name=this-name-should-not-found", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/search/districts?name=this-name-should-not-found", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/search/subdistricts?name=this-name-should-not-found", 404, async (res) => {
  (await json(res)).message();
});

FETCH.GET("/search/villages?name=this-name-should-not-found", 404, async (res) => {
  (await json(res)).message();
});

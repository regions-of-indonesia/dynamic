import { Hono } from "hono/mod.ts";

import { splitRegionCode } from "@regions-of-indonesia/utils";

import {
  getProvinces,
  findProvince,
  findDistrict,
  findSubdistrict,
  findVillage,
  filterDistricts,
  filterSubdistricts,
  filterVillages,
  searchProvinces,
  searchDistricts,
  searchSubdistricts,
  searchVillages,
  exceptionBadRequest,
  getValidCodeParam,
  getValidNameQuery,
  jsonFoundRegion,
  jsonFoundRegions,
} from "~/regions-of-indonesia.ts";

const route = (fn: (hono: Hono) => Hono) => fn(new Hono());

const provinces = route((x) =>
  x
    .get("/", async (ctx) => {
      return jsonFoundRegions(ctx, await getProvinces());
    })
    .get("/:code/districts", async (ctx) => {
      return jsonFoundRegions(ctx, await filterDistricts(getValidCodeParam(ctx)));
    })
    .get("/:code", async (ctx) => {
      return jsonFoundRegion(ctx, await findProvince(getValidCodeParam(ctx)));
    })
);

const districts = route((x) =>
  x
    .get("/:code/subdistricts", async (ctx) => {
      return jsonFoundRegions(ctx, await filterSubdistricts(getValidCodeParam(ctx)));
    })
    .get("/:code", async (ctx) => {
      return jsonFoundRegion(ctx, await findDistrict(getValidCodeParam(ctx)));
    })
);

const subdistricts = route((x) =>
  x
    .get("/:code/villages", async (ctx) => {
      return jsonFoundRegions(ctx, await filterVillages(getValidCodeParam(ctx)));
    })
    .get("/:code", async (ctx) => {
      return jsonFoundRegion(ctx, await findSubdistrict(getValidCodeParam(ctx)));
    })
);

const villages = route((x) =>
  x.get("/:code", async (ctx) => {
    return jsonFoundRegion(ctx, await findVillage(getValidCodeParam(ctx)));
  })
);

const region = route((x) =>
  x.get("/:code", async (ctx) => {
    const code = getValidCodeParam(ctx);
    const length = splitRegionCode(code).length;
    if (length < 1 || length > 4) throw exceptionBadRequest("Invalid length of region code");

    return jsonFoundRegion(
      ctx,
      length === 1
        ? await findProvince(code)
        : length === 2
        ? await findDistrict(code)
        : length === 3
        ? await findSubdistrict(code)
        : length === 4
        ? await findVillage(code)
        : undefined
    );
  })
);

const search = route((x) =>
  x
    .get("/", async (ctx) => {
      const name = getValidNameQuery(ctx);
      return jsonFoundRegions(ctx, [
        ...(await searchProvinces(name)),
        ...(await searchDistricts(name)),
        ...(await searchSubdistricts(name)),
        ...(await searchVillages(name)),
      ]);
    })
    .get("/provinces", async (ctx) => {
      return jsonFoundRegions(ctx, await searchProvinces(getValidNameQuery(ctx)));
    })
    .get("/districts", async (ctx) => {
      return jsonFoundRegions(ctx, await searchDistricts(getValidNameQuery(ctx)));
    })
    .get("/subdistricts", async (ctx) => {
      return jsonFoundRegions(ctx, await searchSubdistricts(getValidNameQuery(ctx)));
    })
    .get("/villages", async (ctx) => {
      return jsonFoundRegions(ctx, await searchVillages(getValidNameQuery(ctx)));
    })
);

export { provinces, districts, subdistricts, villages, region, search };

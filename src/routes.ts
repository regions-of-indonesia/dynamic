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

const provinces = new Hono()
  .get("/", async (ctx) => jsonFoundRegions(ctx, await getProvinces()))
  .get("/:code/districts", async (ctx) => jsonFoundRegions(ctx, await filterDistricts(getValidCodeParam(ctx))))
  .get("/:code", async (ctx) => jsonFoundRegion(ctx, await findProvince(getValidCodeParam(ctx))));

const districts = new Hono()
  .get("/:code/subdistricts", async (ctx) => jsonFoundRegions(ctx, await filterSubdistricts(getValidCodeParam(ctx))))
  .get("/:code", async (ctx) => jsonFoundRegion(ctx, await findDistrict(getValidCodeParam(ctx))));

const subdistricts = new Hono()
  .get("/:code/villages", async (ctx) => jsonFoundRegions(ctx, await filterVillages(getValidCodeParam(ctx))))
  .get("/:code", async (ctx) => jsonFoundRegion(ctx, await findSubdistrict(getValidCodeParam(ctx))));

const villages = new Hono().get("/:code", async (ctx) => jsonFoundRegion(ctx, await findVillage(getValidCodeParam(ctx))));

const region = new Hono().get("/:code", async (ctx) => {
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
});

const search = new Hono()
  .get("/", async (ctx) => {
    const name = getValidNameQuery(ctx);
    return jsonFoundRegions(ctx, [
      ...(await searchProvinces(name)),
      ...(await searchDistricts(name)),
      ...(await searchSubdistricts(name)),
      ...(await searchVillages(name)),
    ]);
  })
  .get("/provinces", async (ctx) => jsonFoundRegions(ctx, await searchProvinces(getValidNameQuery(ctx))))
  .get("/districts", async (ctx) => jsonFoundRegions(ctx, await searchDistricts(getValidNameQuery(ctx))))
  .get("/subdistricts", async (ctx) => jsonFoundRegions(ctx, await searchSubdistricts(getValidNameQuery(ctx))))
  .get("/villages", async (ctx) => jsonFoundRegions(ctx, await searchVillages(getValidNameQuery(ctx))));

export { provinces, districts, subdistricts, villages, region, search };

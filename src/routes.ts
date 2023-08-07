import { Hono } from "hono/mod.ts";

import type { Region } from "@regions-of-indonesia/types";
import { splitRegionCode } from "@regions-of-indonesia/utils";

import { RESOURCE_PROVINCE, RESOURCE_DISTRICT, RESOURCE_SUBDISTRICT, RESOURCE_VILLAGE } from "~/libs.ts";
import {
  filterDistrictsByProvince,
  filterSubdistrictsByDistrict,
  filterVillagesBySubdistrict,
  exception,
  exceptionBadRequestParamRegionCode,
  exceptionBadRequestQueryRegionName,
  jsonNotFoundRegion,
  jsonNotFoundRegions,
} from "~/libs.ts";

const route = (fn: (hono: Hono) => Hono) => fn(new Hono());

const provinces = route((x) =>
  x
    .get("/", (ctx) => {
      return ctx.json(RESOURCE_PROVINCE.arr);
    })
    .get("/:code/districts", (c) => {
      return jsonNotFoundRegions(c, filterDistrictsByProvince(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
    .get("/:code", (c) => {
      return jsonNotFoundRegion(c, RESOURCE_PROVINCE.find(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
);

const districts = route((x) =>
  x
    .get("/:code/subdistricts", (c) => {
      return jsonNotFoundRegions(c, filterSubdistrictsByDistrict(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
    .get("/:code", (c) => {
      return jsonNotFoundRegion(c, RESOURCE_DISTRICT.find(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
);

const subdistricts = route((x) =>
  x
    .get("/:code/villages", (c) => {
      return jsonNotFoundRegions(c, filterVillagesBySubdistrict(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
    .get("/:code", (c) => {
      return jsonNotFoundRegion(c, RESOURCE_SUBDISTRICT.find(exceptionBadRequestParamRegionCode(c.req.param("code"))));
    })
);

const villages = route((x) =>
  x.get("/:code", (c) => {
    return jsonNotFoundRegion(c, RESOURCE_VILLAGE.find(exceptionBadRequestParamRegionCode(c.req.param("code"))));
  })
);

const region = route((x) =>
  x.get("/:code", (c) => {
    const code = exceptionBadRequestParamRegionCode(c.req.param("code"));
    const { length } = splitRegionCode(code);
    if (length < 1 || length > 4) throw exception(400, "Invalid ?code param");
    let region: Region | undefined;
    if (length === 1) region = RESOURCE_PROVINCE.find(code);
    else if (length === 2) region = RESOURCE_DISTRICT.find(code);
    else if (length === 3) region = RESOURCE_SUBDISTRICT.find(code);
    else if (length === 4) region = RESOURCE_VILLAGE.find(code);
    return jsonNotFoundRegion(c, region);
  })
);

const search = route((x) =>
  x
    .get("/", (c) => {
      const name = exceptionBadRequestQueryRegionName(c.req.query("name"));
      return jsonNotFoundRegions(c, [
        ...RESOURCE_PROVINCE.search(name),
        ...RESOURCE_DISTRICT.search(name),
        ...RESOURCE_SUBDISTRICT.search(name),
        ...RESOURCE_VILLAGE.search(name),
      ] satisfies Region[]);
    })
    .get("/provinces", (c) => {
      return jsonNotFoundRegions(c, RESOURCE_PROVINCE.search(exceptionBadRequestQueryRegionName(c.req.query("name"))));
    })
    .get("/districts", (c) => {
      return jsonNotFoundRegions(c, RESOURCE_DISTRICT.search(exceptionBadRequestQueryRegionName(c.req.query("name"))));
    })
    .get("/subdistricts", (c) => {
      return jsonNotFoundRegions(c, RESOURCE_SUBDISTRICT.search(exceptionBadRequestQueryRegionName(c.req.query("name"))));
    })
    .get("/villages", (c) => {
      return jsonNotFoundRegions(c, RESOURCE_VILLAGE.search(exceptionBadRequestQueryRegionName(c.req.query("name"))));
    })
);

export { provinces, districts, subdistricts, villages, region, search };

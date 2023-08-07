import { Context, HTTPException } from "hono/mod.ts";

import Fuse from "fuse.js";

import type { Region } from "@regions-of-indonesia/types";
import { isRegionCode, isRegionName, joinRegionCode, splitRegionCode } from "@regions-of-indonesia/utils";
import { PROVINCE, DISTRICT, SUBDISTRICT, VILLAGE } from "@regions-of-indonesia/data";

const cache = <T>() => {
  const record: Record<string, T> = {};
  return {
    has(key: string) {
      return key in record;
    },
    get(key: string): T | undefined {
      if (this.has(key)) return record[key];
    },
    set(key: string, value: T) {
      record[key] = value;
      return value;
    },
  };
};

const createResource = (record: Record<string, string>) => {
  const arr: Region[] = [];
  for (const code in record) arr.push({ code, name: record[code] });
  const fuse = new Fuse(arr, { keys: ["name"], threshold: 0.1 });

  const $cache = cache<Region | undefined>();
  const find = (code: string) =>
    $cache.has(code)
      ? $cache.get(code)!
      : $cache.set(
          code,
          arr.find((el) => el.code === code)
        );

  const $search = cache<Region[]>();
  const search = (name: string) =>
    $search.has(name)
      ? $search.get(name)!
      : $search.set(
          name,
          fuse.search(name, { limit: 20 }).map(({ item }) => item)
        );

  return { arr, find, search };
};

const createByParentFilter = (arr: Region[]) => {
  const $filter = cache<Region[]>();

  const filter = (code: string) => {
    let splitted: string[] = [];
    return $filter.has(code)
      ? $filter.get(code)!
      : $filter.set(
          code,
          arr.filter((el) => {
            splitted = splitRegionCode(el.code);
            return code === joinRegionCode(splitted.slice(0, splitted.length - 1));
          })
        );
  };

  return filter;
};

const RESOURCE_PROVINCE = createResource(PROVINCE);
const RESOURCE_DISTRICT = createResource(DISTRICT);
const RESOURCE_SUBDISTRICT = createResource(SUBDISTRICT);
const RESOURCE_VILLAGE = createResource(VILLAGE);

const filterDistrictsByProvince = createByParentFilter(RESOURCE_DISTRICT.arr);
const filterSubdistrictsByDistrict = createByParentFilter(RESOURCE_SUBDISTRICT.arr);
const filterVillagesBySubdistrict = createByParentFilter(RESOURCE_VILLAGE.arr);

const msg = (message: string) => ({ message });

const exception = (status: number, message: string) => {
  return new HTTPException(status, {
    message,
    res: new Response(JSON.stringify(msg(message)), { headers: { "content-type": "application/json" }, status }),
  });
};

const exceptionBadRequestParamRegionCode = (value?: unknown) => {
  if (isRegionCode(value)) return value;
  throw exception(400, "Invalid code param");
};
const exceptionBadRequestQueryRegionName = (value?: unknown) => {
  if (isRegionName(value)) return value;
  throw exception(400, "Invalid name query");
};
const jsonNotFoundRegion = (c: Context, value?: Region) => {
  if (typeof value === "undefined") throw exception(404, "Region not found");
  return c.json(value);
};
const jsonNotFoundRegions = (c: Context, value: Region[]) => {
  if (value.length < 1) throw exception(404, "Regions not found");
  return c.json(value);
};

export { RESOURCE_PROVINCE, RESOURCE_DISTRICT, RESOURCE_SUBDISTRICT, RESOURCE_VILLAGE };
export { filterDistrictsByProvince, filterSubdistrictsByDistrict, filterVillagesBySubdistrict };
export { exception, exceptionBadRequestParamRegionCode, exceptionBadRequestQueryRegionName, jsonNotFoundRegion, jsonNotFoundRegions };

import { Context, HTTPException } from "hono/mod.ts";

import type { Region } from "@regions-of-indonesia/types";
import { isRegionCode, isRegionName, joinRegionCode, splitRegionCode } from "@regions-of-indonesia/utils";

let PROVINCES: Region[] | undefined;
let DISTRICTS: Region[] | undefined;
let SUBDISTRICTS: Region[] | undefined;
let VILLAGES: Region[] | undefined;

const recordToArray = (record: Record<string, string>) => {
  const array: Region[] = [];
  for (const code in record) array.push({ code, name: record[code] });
  return array;
};

const getProvinces = async (): Promise<Region[]> =>
  (PROVINCES ??= recordToArray((await import("@regions-of-indonesia/data/province")).default));
const getDistricts = async (): Promise<Region[]> =>
  (DISTRICTS ??= recordToArray((await import("@regions-of-indonesia/data/district")).default));
const getSubdistricts = async (): Promise<Region[]> =>
  (SUBDISTRICTS ??= recordToArray((await import("@regions-of-indonesia/data/subdistrict")).default));
const getVillages = async (): Promise<Region[]> =>
  (VILLAGES ??= recordToArray((await import("@regions-of-indonesia/data/village")).default));

const MEMO_FIND_REGION: Record<string, Region | undefined> = {};

const findRegion = (code: string, regions: Region[]) => (MEMO_FIND_REGION[code] ??= regions.find((region) => region.code === code));

const findProvince = async (code: string) => findRegion(code, await getProvinces());
const findDistrict = async (code: string) => findRegion(code, await getDistricts());
const findSubdistrict = async (code: string) => findRegion(code, await getSubdistricts());
const findVillage = async (code: string) => findRegion(code, await getVillages());

const MEMO_FILTER_REGIONS: Record<string, Region[]> = {};

const filterRegions = (parent: string, regions: Region[]) => {
  let splitted: string[] = [];
  return (MEMO_FILTER_REGIONS[parent] ??= regions.filter(
    (region) => ((splitted = splitRegionCode(region.code)), parent === joinRegionCode(splitted.slice(0, splitted.length - 1)))
  ));
};

const filterDistricts = async (parent: string) => filterRegions(parent, await getDistricts());
const filterSubdistricts = async (parent: string) => filterRegions(parent, await getSubdistricts());
const filterVillages = async (parent: string) => filterRegions(parent, await getVillages());

const simpleSearchRegions = (() => {
  type Result = { score: number } & Region;

  const limit = 25,
    sortFn = (a: Result, b: Result): number => b.score - a.score;

  return (query: string, regions: Region[]): Region[] => {
    query = query.toLowerCase();

    const results: Result[] = [],
      pick: Region[] = [];

    let index: number, score: number, code: string, name: string;

    for ({ code, name } of regions) {
      if ((index = name.toLowerCase().indexOf(query)) !== -1) {
        if ((score = 1 / (index + 1)) > 0) results.push({ score, code, name });
      }
    }

    results.sort(sortFn);

    for (index = 0; index < results.length; index++) {
      if (index >= limit) break;
      ({ code, name } = results[index]);
      pick.push({ code, name });
    }

    return pick;
  };
})();

const MEMO_SEARCH_PROVINCES: Record<string, Region[]> = {};
const MEMO_SEARCH_DISTRICTS: Record<string, Region[]> = {};
const MEMO_SEARCH_SUBDISTRICTS: Record<string, Region[]> = {};
const MEMO_SEARCH_VILLAGES: Record<string, Region[]> = {};

const searchProvinces = async (name: string) => (MEMO_SEARCH_PROVINCES[name] ??= simpleSearchRegions(name, await getProvinces()));
const searchDistricts = async (name: string) => (MEMO_SEARCH_DISTRICTS[name] ??= simpleSearchRegions(name, await getDistricts()));
const searchSubdistricts = async (name: string) => (MEMO_SEARCH_SUBDISTRICTS[name] ??= simpleSearchRegions(name, await getSubdistricts()));
const searchVillages = async (name: string) => (MEMO_SEARCH_VILLAGES[name] ??= simpleSearchRegions(name, await getVillages()));

const exceptionBadRequest = (message: string) => new HTTPException(400, { message });
const exceptionNotFound = (message: string) => new HTTPException(404, { message });

const getValidCode = (code: unknown) => {
  if (isRegionCode(code)) return code;
  throw exceptionBadRequest("Invalid region code");
};

const getValidCodeParam = (context: Context) => getValidCode(context.req.param("code"));

const getValidName = (name: unknown) => {
  if (isRegionName(name)) return name;
  throw exceptionBadRequest("Invalid region name");
};

const getValidNameQuery = (context: Context) => getValidName(context.req.query("name"));

const jsonFoundRegion = (context: Context, region?: Region) => {
  if (typeof region !== "undefined") return context.json(region, 200);
  throw exceptionNotFound("Region not found");
};

const jsonFoundRegions = (context: Context, regions?: Region[]) => {
  if (typeof regions !== "undefined" && regions.length > 0) return context.json(regions, 200);
  throw exceptionNotFound("Regions not found");
};

export { getProvinces, getDistricts, getSubdistricts, getVillages };
export { findProvince, findDistrict, findSubdistrict, findVillage };
export { filterDistricts, filterSubdistricts, filterVillages };
export { searchProvinces, searchDistricts, searchSubdistricts, searchVillages };
export { exceptionBadRequest, exceptionNotFound };
export { getValidCodeParam, getValidNameQuery };
export { jsonFoundRegion, jsonFoundRegions };

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
  PROVINCES ? PROVINCES : (PROVINCES = recordToArray((await import("@regions-of-indonesia/data/province")).PROVINCE));
const getDistricts = async (): Promise<Region[]> =>
  DISTRICTS ? DISTRICTS : (DISTRICTS = recordToArray((await import("@regions-of-indonesia/data/district")).DISTRICT));
const getSubdistricts = async (): Promise<Region[]> =>
  SUBDISTRICTS ? SUBDISTRICTS : (SUBDISTRICTS = recordToArray((await import("@regions-of-indonesia/data/subdistrict")).SUBDISTRICT));
const getVillages = async (): Promise<Region[]> =>
  VILLAGES ? VILLAGES : (VILLAGES = recordToArray((await import("@regions-of-indonesia/data/village")).VILLAGE));

const MEMO_FIND_REGION: Record<string, Region | undefined> = {};

const findRegion = (code: string, regions: Region[]) => {
  return (MEMO_FIND_REGION[code] ??= regions.find((region) => region.code === code));
};

const findProvince = async (code: string) => findRegion(code, await getProvinces());
const findDistrict = async (code: string) => findRegion(code, await getDistricts());
const findSubdistrict = async (code: string) => findRegion(code, await getSubdistricts());
const findVillage = async (code: string) => findRegion(code, await getVillages());

const MEMO_FILTER_REGIONS: Record<string, Region[]> = {};

const filterRegions = (parent: string, regions: Region[]) => {
  let splitted: string[] = [];
  return (MEMO_FILTER_REGIONS[parent] ??= regions.filter((region) => {
    splitted = splitRegionCode(region.code);
    return parent === joinRegionCode(splitted.slice(0, splitted.length - 1));
  }));
};

const filterDistricts = async (parent: string) => filterRegions(parent, await getDistricts());
const filterSubdistricts = async (parent: string) => filterRegions(parent, await getSubdistricts());
const filterVillages = async (parent: string) => filterRegions(parent, await getVillages());

const simpleSearchRegions = (() => {
  type Result = { score: number; item: Region };

  const limit = 25;
  const sortFn = (a: Result, b: Result) => b.score - a.score;
  const mapFn = (result: Result) => result.item;

  return (query: string, data: Region[]): Region[] => {
    const results: Result[] = [];

    query = query.toLowerCase();

    let key: keyof Region;
    let normalizedValue: string;
    let index: number;

    for (const item of data) {
      let score = 0;

      for (key in item) {
        if (key in item && typeof item[key] === "string") {
          normalizedValue = item[key].toLowerCase();
          index = normalizedValue.indexOf(query);
          if (index !== -1) score += 1 / (index + 1);
        }
      }

      if (score > 0) results.push({ item, score });
    }

    results.sort(sortFn);

    return results.slice(0, limit).map(mapFn);
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

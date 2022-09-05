import { Callable2, Dictionary, JsonResponse } from "./types";

function localhostServer() {
  const key = "localhostServer";
  let s = localStorage.getItem(key);
  if (s === null) {
    s = "tes4:8080";
    localStorage.setItem(key, s);
  }
  if (!(window as any).localhostServer) {
    console.warn(
      `Using upstream server ${key}=${s}. Change in Dev Tools --> Application --> Local Storage & refresh.`
    );
    (window as any).localhostServer = "s";
  }
  return s;
}

export const ws_uri = (() => {
  const loc = window.location;
  if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
    return `ws://${localhostServer()}/labctl/ws`;
  }
  const ws = loc.protocol === "https:" ? "wss" : "ws";
  return `${ws}://${loc.host}/labctl/ws`;
})();

export const api_uri = (() => {
  const loc = window.location;
  if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
    return `http://${localhostServer()}`;
  }
  return `${loc.protocol}//${loc.host}`;
})();

export function $set_array(target: any[], source: any[]): void {
  target.splice(source.length);
  for (let i = 0; i < source.length; i += 1) {
    target[i] = source[i];
  }
}

export function $set_object(target: Dictionary, source: Dictionary): void {
  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      delete target[key];
    }
  });
  Object.keys(source).forEach((key) => {
    target[key] = source[key];
  });
}

export function isObject(value: any) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Sort a dictionary */
export function sortDictionary(
  obj: Dictionary,
  compareKeys: Callable2<string, string, number>,
  filterObj?: Dictionary
) {
  const f = typeof filterObj === "undefined" ? {} : filterObj;
  const sortedKeys = Object.keys(obj).sort(compareKeys);
  // build a new dictionary "accumulator" in the correct order
  return sortedKeys.reduce((accumulator: Dictionary, k: string) => {
    const same = k in f && JSON.stringify(f[k]) === JSON.stringify(obj[k]);
    if (!same) {
      accumulator[k] = obj[k];
    }
    return accumulator;
  }, {});
}

export async function json_fetch(
  url: string,
  data?: Dictionary
): Promise<JsonResponse> {
  const opt = data
    ? {
        method: "POST",
        body: JSON.stringify(data),
      }
    : {
        method: "GET",
      };

  try {
    const response = await fetch(api_uri + url, {
      //credentials: "include" as const,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      redirect: "error" as const,
      ...opt,
    });
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return Promise.resolve(await response.json());
  } catch (error) {
    return Promise.reject(error);
  }
}

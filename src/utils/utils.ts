import { Dictionary } from "./types";

export const ws_uri = (() => {
  const loc = window.location;
  if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
    return "ws://tes4:8080/labctl/ws";
  }
  var new_uri = loc.protocol === "https:" ? "wss:" : "ws:";
  new_uri += "//" + loc.host + "/labctl/ws";
  return new_uri;
})();

export const api_uri = (() => {
  const loc = window.location;
  if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
    return "http://tes4:8080";
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

export async function json_fetch(
  url: string,
  data?: Dictionary
): Promise<Dictionary> {
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

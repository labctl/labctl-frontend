//eslint-disable-next-line
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
    // Vue.set(target, i, source[i]);
    target[i] = source[i];
  }
}

export function $set_object(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      // Vue.set(target, key, undefined);
      delete target[key];
    }
  });
  Object.keys(source).forEach((key) => {
    //Vue.set(target, key, source[key]);
    target[key] = source[key];
  });
}

export function json_fetch(
  url: string,
  data?: Dictionary
): Promise<Dictionary> {
  const opt = data
    ? {
        method: "POST",
        //credentials: "include" as const,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        redirect: "error" as const,
      }
    : {
        method: "GET",
        //credentials: "include" as const,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        redirect: "error" as const,
      };

  // eslint-disable-next-line no-undef
  return new Promise<Dictionary>(
    // eslint-disable-next-line
    async (resolve, reject) => {
      let response;
      try {
        response = await fetch(api_uri + url, opt);
      } catch (error) {
        return reject(error);
      }
      if (!response.ok) {
        return reject(response.statusText);
      }
      resolve(await response.json());
    }
  );
}

export function debounce(delay: number, fn: () => void): () => void {
  let timeoutID: number;
  return (...args) => {
    clearTimeout(timeoutID);
    // eslint-disable-next-line
    // @ts-ignore
    const that = this as any;
    timeoutID = setTimeout(() => {
      fn.apply(that, args);
    }, delay);
  };
}

// export const versions: {[key: string]: string[]} = {
//   SR: ['13.0.R4', '14.0.R1', '14.0.R4',
//     '15.0.R1', '15.0.R4', '15.1.R1', '16.0.R1', '16.0.R4',
//     '19.5.R1', '19.7.R1', '19.10.R1',
//     '20.2.R1', '20.5.R1', '20.7.R1', '20.10.R1',
//     '21.2.R1', '21.5.R1', '21.7.R1', '21.10.R1', '22.2.R1'].reverse(),
//   IXR: ['20.2.R1', '20.5.R1', '20.7.R1', '20.10.R1',
//     '21.2.R1', '21.5.R1', '21.7.R1', '21.10.R1', '22.2.R1'].reverse(),
//   SAS: ['20.9.R1', '21.3.R1'].reverse(),
//   SAR: ['20.10.R1', '21.4.R1', '21.4.R1 HW'].reverse(),
//   NSP: ['21.3'].reverse(),
// };

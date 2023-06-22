/** If localhost, get localhost+port from local storage, else null */
function lhURL(): URL {
  let u = localStorage.getItem("localhost")
  if (u === null) {
    u = "https://tes4:8080/labctl"
    localStorage.setItem("localhost", u)
  }
  return new URL(u)
}

export const localhost = (() => {
  if (typeof window === "undefined") return ""
  const h = window.location.hostname
  if (!(h === "localhost" || h === "127.0.0.1")) {
    return ""
  }
  const url = lhURL()
  console.warn(
    `Using upstream server ${url.host}${url.pathname}. Change in Dev Tools --> Application --> Local Storage [key=localhost] & refresh.`
  )
  return url.host
})()

export const base_uri = (() => {
  if (localhost) {
    const url = lhURL()
    if (url.pathname && url.pathname !== "/") {
      return url.pathname.endsWith("/") ? url.pathname : url.pathname + "/"
    }
  }
  if (typeof window === "undefined") return "/labctl/"
  const p = window.location.pathname.split("/", 2)
  return `/${p[1] || "labctl"}/`
})()

export const api_uri = (() => {
  if (typeof window === "undefined") return ""
  return localhost
    ? `http://${localhost}`
    : `${window.location.protocol}//${window.location.host}`
})()

export const ws_uri = (() => {
  if (typeof window === "undefined") return ""
  const ws = window.location.protocol === "https:" ? "wss:" : "ws:"
  return localhost
    ? `${ws}//${localhost}${base_uri}ws`
    : `${ws}//${window.location.host}${base_uri}ws`
})()

export const base_uri = (() => {
  if (typeof window === "undefined") return "/labctl/"
  const p = window.location.pathname.split("/", 2)
  return `/${p[1] || "labctl"}/`
})()

/** If localhost, get localhost+port from local storage, else null */
const localhost = (() => {
  if (typeof window === "undefined") return ""
  if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return ""
  }
  const key = "localhost"
  let s = localStorage.getItem(key)
  if (s === null) {
    s = "tes4:8080"
    localStorage.setItem(key, s)
  }
  if (!(window as any).localhostServer) {
    console.warn(
      `Using upstream server ${key}=${s}. Change in Dev Tools --> Application --> Local Storage & refresh.`
    )
    ;(window as any).localhostServer = "s"
  }
  return s
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

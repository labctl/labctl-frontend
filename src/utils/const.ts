export const base_uri = (() => {
  if (typeof window === "undefined") return "/labctl/"
  const p = window.location.pathname.split("/", 2)
  return `/${p[1] || "labctl"}/`
})()

/** If localhost, get localhost+port from local storage, else null */
export const localhost = (() => {
  if (typeof window === "undefined") return ""
  const lh = "localhost"
  const h = window.location.hostname
  if (!(h === lh || h === "127.0.0.1")) {
    return ""
  }
  let s = localStorage.getItem(lh)
  if (s === null) {
    s = "tes4:8080"
    localStorage.setItem(lh, s)
  }
  console.warn(
    `Using upstream server ${s}. Change in Dev Tools --> Application --> Local Storage [key=${lh}] & refresh.`
  )
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

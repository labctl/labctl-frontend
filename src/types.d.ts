declare module "vue3-json-viewer" {
  export type JsonViewer = import("vue").DefineComponent<{}> // eslint-disable-line
}

declare module "markdown-it-mark" {
  const markdownitmark: import("markdown-it").PluginSimple
  export = markdownitmark
}

declare module "markdown-it-emoji" {
  export const light: import("markdown-it").PluginSimple
}

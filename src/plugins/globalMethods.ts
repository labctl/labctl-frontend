export function setupGlobalMethods() {
  // Storage.prototype.setObj = function setObj(key: string, obj: any) {
  //   if (typeof obj === "string") {
  //     return this.setItem(key, obj);
  //   }
  //   return this.setItem(key, JSON.stringify(obj));
  // };
  // Storage.prototype.getObj = function getObj(key: string, def: any) {
  //   if (typeof def === "string") {
  //     return this.getItem(key) ?? def;
  //   }
  //   try {
  //     return JSON.parse(this.getItem(key) as string);
  //   } catch (e) {
  //     return def;
  //   }
  // };
}

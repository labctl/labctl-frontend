import { Dictionary } from "./types";

export function fFarEndNode(far: string) {
  return (l: Dictionary) => {
    if (!("clab_far" in l)) {
      console.log(`clab_far not in dictionary. Filtering on ${far}: ${l}`);
      return true;
    }
    const f = l.clab_far as Dictionary;
    if (!("clab_node" in f)) {
      console.log(
        `clab_far.clab_node not in dictionary. Filtering on ${far}: ${l}`
      );
      return true;
    }
    return f.clab_node === far;
  };
}

import { Dictionary, Point, Links, Link } from "./types";

/** filter function for links ensure we match clab_far.clab_node */
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

/** Calculate the differences between 2 points */
function diff(p1: Point, p2: Point): Point {
  return { x: p1.x - p2.x, y: p1.y - p2.y } as Point;
}

/** Calculate the label.direction for v-network graph */
export function labelDirection(
  nodes: Record<string, Point>,
  links: Links,
  debug?: boolean
) {
  const res: Record<string, string> = {};
  Object.keys(nodes).forEach((n) => {
    res[n] = "south";
    const node = {
      n: 0,
      s: 0,
      e: 0,
      w: 0,
      pts: [] as Point[],
    };

    // collect all far end points
    Object.values(links).forEach((l1: Link) => {
      if (l1.source === n && l1.source in nodes && l1.target in nodes) {
        node.pts.push(diff(nodes[l1.target], nodes[n]));
      }
      if (l1.target === n && l1.source in nodes && l1.target in nodes) {
        node.pts.push(diff(nodes[l1.source], nodes[n]));
      }
    });

    node.pts.forEach((p) => {
      node[p.y < 0 ? "n" : "s"] += Math.atan(Math.abs(p.y / p.x));
      node[p.x < 0 ? "w" : "e"] += Math.atan(Math.abs(p.x / p.y));
    });

    // Pick the best direction (lowest, preference: s,n,e,w)
    let low = node.s;
    if (node.n < low) {
      low = node.n;
      res[n] = "north";
    }
    if (node.e < low) {
      low = node.e;
      res[n] = "east";
    }
    if (node.w < low) {
      res[n] = "west";
    }

    if (debug) console.debug(res[n], node);
  });

  return res;
}

interface TTemplateFN {
  name: string;
  role: string;
  ext: string;
}

/** Parse the template filename into parts */
export function parseTemplateFN(name: string): TTemplateFN {
  const n = name.split("__");
  const r = n[1].split(".");
  return { name: n[0], role: r[0], ext: r[1] };
}

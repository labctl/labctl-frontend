import { Dictionary, Point, Links, Link } from "./types";

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

interface rr {
  points: Point[];
  n: number;
  s: number;
  pos: string;
}

function diff(p1: Point, p2: Point): Point {
  return { x: p1.x - p2.x, y: p1.y - p2.y } as Point;
}

export function labelPosition(nodes: Record<string, Point>, links: Links) {
  // filter all links with no endpoint
  const res: Record<string, rr> = {};
  Object.keys(nodes).forEach((n) => {
    res[n] = Object.values(links).reduce(
      (acc: rr, l1: Link) => {
        if (l1.source === n && l1.source in nodes && l1.target in nodes) {
          acc.points.push(diff(nodes[l1.target], nodes[n]));
        }
        if (l1.target === n && l1.source in nodes && l1.target in nodes) {
          acc.points.push(diff(nodes[l1.target], nodes[n]));
        }
        return acc;
      },
      { points: [] as Point[], n: 0, s: 0 } as rr
    );

    res[n].points.forEach((p) => {
      const ratio = Math.abs(p.y / p.x);
      if (p.y < 0) {
        res[n].n += ratio;
      } else {
        res[n].s += ratio;
      }
    });
  });

  return res;
}

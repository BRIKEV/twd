import type { Node } from './buildTreeFromHandlers';

/**
 * Split a test tree in two by a per-test predicate, keeping the describe
 * structure on each side. Suites that end up empty on a side are dropped from
 * it; a suite with no tests at all stays on the matching side.
 */
export const partitionTree = (
  roots: Node[],
  isMatch: (test: Node) => boolean,
): { matching: Node[]; other: Node[] } => {
  const split = (node: Node): { matching: Node | null; other: Node | null } => {
    if (node.type === 'test') {
      return isMatch(node) ? { matching: node, other: null } : { matching: null, other: node };
    }
    const children = node.childrenNodes ?? [];
    if (children.length === 0) return { matching: node, other: null };

    const matchingChildren: Node[] = [];
    const otherChildren: Node[] = [];
    for (const child of children) {
      const result = split(child);
      if (result.matching) matchingChildren.push(result.matching);
      if (result.other) otherChildren.push(result.other);
    }
    return {
      matching: matchingChildren.length ? { ...node, childrenNodes: matchingChildren } : null,
      other: otherChildren.length ? { ...node, childrenNodes: otherChildren } : null,
    };
  };

  const matching: Node[] = [];
  const other: Node[] = [];
  for (const root of roots) {
    const result = split(root);
    if (result.matching) matching.push(result.matching);
    if (result.other) other.push(result.other);
  }
  return { matching, other };
};

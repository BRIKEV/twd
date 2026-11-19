import type { Node } from './buildTreeFromHandlers';

/**
 * Mark the tests written for another viewport, without moving them: each keeps
 * its place in its describe. A test gets `viewportBadge`, the viewport(s) it was
 * written for. A suite gets one too when every test under it is for another
 * viewport, so the list can grey and collapse it as a whole. A suite with no
 * tests is left alone. Returns a new tree.
 */
export const markOtherViewports = (
  roots: Node[],
  isMatch: (test: Node) => boolean,
  badgeFor: (test: Node) => string,
): Node[] => {
  const mark = (node: Node): Node => {
    if (node.type === 'test') {
      return isMatch(node) ? node : { ...node, viewportBadge: badgeFor(node) };
    }
    const childrenNodes = (node.childrenNodes ?? []).map(mark);
    const tests = collectTests(childrenNodes);
    const allOther = tests.length > 0 && tests.every((test) => test.viewportBadge !== undefined);
    if (!allOther) return { ...node, childrenNodes };
    const names = new Set(tests.flatMap((test) => (test.viewportBadge ?? '').split(', ')));
    return { ...node, childrenNodes, viewportBadge: [...names].filter(Boolean).join(', ') };
  };
  return roots.map(mark);
};

const collectTests = (nodes: Node[]): Node[] =>
  nodes.flatMap((node) => (node.type === 'test' ? [node] : collectTests(node.childrenNodes ?? [])));

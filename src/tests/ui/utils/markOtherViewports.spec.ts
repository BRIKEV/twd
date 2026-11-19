import { describe, it, expect } from 'vitest';
import { markOtherViewports } from '../../../ui/utils/markOtherViewports';
import type { Node } from '../../../ui/utils/buildTreeFromHandlers';

const test = (id: string, parent?: string): Node => ({
  id,
  name: id,
  type: 'test',
  depth: parent ? 1 : 0,
  parent,
});

const suite = (id: string, childrenNodes: Node[], parent?: string): Node => ({
  id,
  name: id,
  type: 'suite',
  depth: parent ? 1 : 0,
  parent,
  childrenNodes,
});

const BADGES: Record<string, string> = {
  nav: 'desktop',
  table: 'desktop',
  cards: 'tablet',
  typo: 'unknown: deskop',
};
const badgeFor = (node: Node) => BADGES[node.id] ?? '';

describe('markOtherViewports', () => {
  it('badges the tests for other viewports and keeps them in place', () => {
    const roots = [suite('Header', [test('burger', 'Header'), test('nav', 'Header')])];
    const isMatch = (node: Node) => node.id === 'burger';

    const [header] = markOtherViewports(roots, isMatch, badgeFor);

    expect(header.childrenNodes!.map((n) => n.id)).toEqual(['burger', 'nav']);
    expect(header.childrenNodes![0].viewportBadge).toBeUndefined();
    expect(header.childrenNodes![1].viewportBadge).toBe('desktop');
    // A suite with one matching test is not badged.
    expect(header.viewportBadge).toBeUndefined();
  });

  it('badges a suite whose tests are all for other viewports, nested ones included', () => {
    const roots = [
      suite('Checkout', [
        suite('Summary', [test('table', 'Summary'), test('cards', 'Summary')], 'Checkout'),
        test('typo', 'Checkout'),
      ]),
    ];

    const [checkout] = markOtherViewports(roots, () => false, badgeFor);

    expect(checkout.viewportBadge).toBe('desktop, tablet, unknown: deskop');
    expect(checkout.childrenNodes![0].viewportBadge).toBe('desktop, tablet');
  });

  it('leaves a suite with no tests alone', () => {
    const [empty] = markOtherViewports([suite('Empty', [])], () => false, badgeFor);
    expect(empty.viewportBadge).toBeUndefined();
  });

  it('does not mutate the input tree', () => {
    const roots = [suite('Header', [test('nav', 'Header')])];
    markOtherViewports(roots, () => false, badgeFor);
    expect(roots[0].viewportBadge).toBeUndefined();
    expect(roots[0].childrenNodes![0].viewportBadge).toBeUndefined();
  });
});

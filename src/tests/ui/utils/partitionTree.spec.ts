import { describe, it, expect } from 'vitest';
import { partitionTree } from '../../../ui/utils/partitionTree';
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

describe('partitionTree', () => {
  it('splits tests by the predicate and keeps each side as a tree', () => {
    const roots = [
      suite('Header', [test('nav', 'Header'), test('burger', 'Header')]),
      suite('Checkout', [suite('Summary', [test('table', 'Summary')], 'Checkout')]),
    ];
    const mobile = new Set(['burger']);
    const { matching, other } = partitionTree(roots, (node) => mobile.has(node.id));

    expect(matching).toHaveLength(1);
    expect(matching[0].id).toBe('Header');
    expect(matching[0].childrenNodes!.map((n) => n.id)).toEqual(['burger']);

    expect(other.map((n) => n.id)).toEqual(['Header', 'Checkout']);
    expect(other[0].childrenNodes!.map((n) => n.id)).toEqual(['nav']);
    expect(other[1].childrenNodes![0].childrenNodes!.map((n) => n.id)).toEqual(['table']);
  });

  it('keeps suites without any test on the matching side', () => {
    const roots = [suite('Empty', [])];
    const { matching, other } = partitionTree(roots, () => false);
    expect(matching.map((n) => n.id)).toEqual(['Empty']);
    expect(other).toEqual([]);
  });

  it('does not mutate the input tree', () => {
    const roots = [suite('Header', [test('nav', 'Header'), test('burger', 'Header')])];
    partitionTree(roots, (node) => node.id === 'nav');
    expect(roots[0].childrenNodes!.map((n) => n.id)).toEqual(['nav', 'burger']);
  });
});

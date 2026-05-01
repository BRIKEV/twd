import { describe, it, expect } from 'vitest';
import { filterTree } from '../../../ui/utils/filterTree';
import type { Node } from '../../../ui/utils/buildTreeFromHandlers';

const buildNode = (
  overrides: Partial<Node> & { name: string; id: string; type: 'test' | 'suite' },
): Node => ({
  depth: 0,
  ...overrides,
});

describe('filterTree', () => {
  it('returns the full tree when query is empty', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't1', name: 'login test', type: 'test' })],
      }),
    ];
    const result = filterTree(roots, '');
    expect(result).toEqual(roots);
  });

  it('returns empty array when no nodes match', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't1', name: 'login test', type: 'test' })],
      }),
    ];
    const result = filterTree(roots, 'zzzzz');
    expect(result).toEqual([]);
  });

  it('preserves ancestor chain when a test matches', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [
          buildNode({
            id: 's2',
            name: 'Login',
            type: 'suite',
            childrenNodes: [
              buildNode({ id: 't1', name: 'shows error on invalid password', type: 'test' }),
              buildNode({ id: 't2', name: 'redirects on success', type: 'test' }),
            ],
          }),
          buildNode({
            id: 's3',
            name: 'Signup',
            type: 'suite',
            childrenNodes: [buildNode({ id: 't3', name: 'validates email format', type: 'test' })],
          }),
        ],
      }),
    ];
    const result = filterTree(roots, 'error');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Auth');
    expect(result[0].childrenNodes).toHaveLength(1);
    expect(result[0].childrenNodes![0].name).toBe('Login');
    expect(result[0].childrenNodes![0].childrenNodes).toHaveLength(1);
    expect(result[0].childrenNodes![0].childrenNodes![0].name).toBe(
      'shows error on invalid password',
    );
  });

  it('matches describe block names', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't1', name: 'test 1', type: 'test' })],
      }),
      buildNode({
        id: 's2',
        name: 'Dashboard',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't2', name: 'test 2', type: 'test' })],
      }),
    ];
    const result = filterTree(roots, 'auth');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Auth');
    expect(result[0].childrenNodes).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't1', name: 'Login Test', type: 'test' })],
      }),
    ];
    const result = filterTree(roots, 'LOGIN');
    expect(result).toHaveLength(1);
    expect(result[0].childrenNodes).toHaveLength(1);
  });

  it('does not mutate the original tree', () => {
    const child = buildNode({ id: 't1', name: 'matching test', type: 'test' });
    const other = buildNode({ id: 't2', name: 'other test', type: 'test' });
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Suite',
        type: 'suite',
        childrenNodes: [child, other],
      }),
    ];
    filterTree(roots, 'matching');
    expect(roots[0].childrenNodes).toHaveLength(2);
  });

  it('returns matching tests from multiple root suites', () => {
    const roots: Node[] = [
      buildNode({
        id: 's1',
        name: 'Auth',
        type: 'suite',
        childrenNodes: [buildNode({ id: 't1', name: 'auth error', type: 'test' })],
      }),
      buildNode({
        id: 's2',
        name: 'API',
        type: 'suite',
        childrenNodes: [
          buildNode({ id: 't2', name: 'api error', type: 'test' }),
          buildNode({ id: 't3', name: 'api success', type: 'test' }),
        ],
      }),
    ];
    const result = filterTree(roots, 'error');
    expect(result).toHaveLength(2);
    expect(result[1].childrenNodes).toHaveLength(1);
    expect(result[1].childrenNodes![0].name).toBe('api error');
  });
});

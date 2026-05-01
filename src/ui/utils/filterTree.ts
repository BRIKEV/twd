import type { Node } from './buildTreeFromHandlers';

export const filterTree = (roots: Node[], query: string): Node[] => {
  if (!query.trim()) return roots;

  const lowerQuery = query.toLowerCase();

  const filterNode = (node: Node): Node | null => {
    const nameMatches = node.name.toLowerCase().includes(lowerQuery);

    if (node.type === 'test') {
      return nameMatches ? node : null;
    }

    // Suite: check if name matches or any children match
    const filteredChildren = (node.childrenNodes || [])
      .map(filterNode)
      .filter((n): n is Node => n !== null);

    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        childrenNodes: nameMatches ? node.childrenNodes : filteredChildren,
      };
    }

    return null;
  };

  return roots.map(filterNode).filter((n): n is Node => n !== null);
};

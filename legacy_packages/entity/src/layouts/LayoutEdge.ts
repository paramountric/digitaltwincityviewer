import { LayoutNode } from './LayoutNode.js';

type LayoutEdge = {
  id: string;
  source: LayoutNode;
  target: LayoutNode;
};

export { LayoutEdge };

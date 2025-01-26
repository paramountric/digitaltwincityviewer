type LayoutNode = {
  id: string;
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
  parentId?: string; // used in tree layout
  collisionRadius?: number;
  isCluster?: boolean;
};

export { LayoutNode };

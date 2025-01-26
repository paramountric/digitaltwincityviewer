import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

export type NodeStore = {
  selectedNodeId: string | null;
  selectedNodeViewerId: string | null;
};

const nodeStore = new Observable<NodeStore>({
  selectedNodeId: null,
  selectedNodeViewerId: null,
});

export const useNode = () => {
  const [nodeState, setNodeState] = useState(nodeStore.get());

  useEffect(() => {
    return nodeStore.subscribe(setNodeState);
  }, []);

  const actions = useMemo(() => {
    return {
      setSelectedNodeId: (selectedNodeId: string | null) =>
        nodeStore.set({ ...nodeState, selectedNodeId }),
      setSelectedNodeViewerId: (selectedNodeViewerId: string | null) =>
        nodeStore.set({ ...nodeState, selectedNodeViewerId }),
    };
  }, [nodeState]);

  return {
    state: nodeState,
    actions,
  };
};

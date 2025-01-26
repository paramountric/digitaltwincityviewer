import { ForceLayout, Graph, TimeProcessLayout } from '@paramountric/entity';
import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

export type GraphStore = {
  graph: Graph;
  layout: ForceLayout | TimeProcessLayout;
};

const graphStore = new Observable<GraphStore>({
  graph: new Graph(),
  layout: new TimeProcessLayout({}),
});

export const useGraph = () => {
  const [graphState, setGraphState] = useState(graphStore.get());

  useEffect(() => {
    return graphStore.subscribe(setGraphState);
  }, []);

  const actions = useMemo(() => {
    return {
      setGraph: (graph: Graph) => graphStore.set({ ...graphState, graph }),
      setLayout: (layout: ForceLayout | TimeProcessLayout) =>
        graphStore.set({ ...graphState, layout }),
    };
  }, [graphState]);

  return {
    state: graphState,
    actions,
  };
};

import { Node } from '@paramountric/entity';
import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

type NodeMap = {
  [nodeId: string]: Node;
};

// this hook keeps imported entities in memory to create commits or compare to existing entities
export type ImportStore = {
  nodeMap: NodeMap;
  fileType: string | null;
};

const importStore = new Observable<ImportStore>({
  nodeMap: {},
  fileType: null,
});

export const useImport = () => {
  const [importState, setImportState] = useState(importStore.get());

  useEffect(() => {
    return importStore.subscribe(setImportState);
  }, []);

  const actions = useMemo(() => {
    return {
      setEntities: (nodeMap: NodeMap) =>
        importStore.set({ ...importState, nodeMap }),
      setFileType: (fileType: string | null) =>
        importStore.set({ ...importState, fileType }),
      importFromText: (text: string) => {
        //if (importStore.get().fileType?.toLowerCase() === 'ifc') {
        // const entities = getIfcEntities(text);
        // const nodeMap = Object.values(entities).reduce(
        //   (acc: NodeMap, entity) => {
        //     acc[entity.id] = new Node({
        //       id: entity.id,
        //       bounds: entity.bounds,
        //       modelMatrix: entity.modelMatrix,
        //     });
        //     return acc;
        //   },
        //   {}
        // );
        // importStore.set({ ...importState, nodeMap });
        // return nodeMap;
        return {};
        //}
      },
    };
  }, [importState]);

  return {
    state: importState,
    actions,
  };
};

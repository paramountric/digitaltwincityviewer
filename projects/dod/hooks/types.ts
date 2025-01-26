import { Node } from '@paramountric/entity';
import { Schema } from 'jtd';
import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

export type Type = {
  id?: string; // for versions of the same schema/type name
  schema: Schema;
  name: string;
  version?: string;
  streamId?: string;
  streamName?: string;
  commitMessage?: string;
  commitId?: string; // not sure if this is needed if commitId is used as id
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TypeMap = {
  [typeId: string]: Type;
};

// this hook keeps imported entities in memory to create commits or compare to existing entities
export type TypeStore = {
  loadedTypeMap: TypeMap;
  activeTypeId: string | null;
};

const typeStore = new Observable<TypeStore>({
  loadedTypeMap: {},
  activeTypeId: null,
});

export const useTypes = () => {
  const [typeState, setTypeState] = useState(typeStore.get());

  useEffect(() => {
    return typeStore.subscribe(setTypeState);
  }, []);

  const actions = useMemo(() => {
    return {
      // from existing node
      setActiveTypeFromNode: (node: Node) => {
        // from node, generate type state
        //typeStore.set({ ...typeState, typeStateData }),
      },
      setTypes: (types: Type[]) => {
        const typeMap: TypeMap = {};
        for (const type of types) {
          typeMap[type.name] = type;
        }
        typeStore.set({ ...typeState, loadedTypeMap: typeMap });
      },
      addType: (type: Type) => {
        typeState.loadedTypeMap[type.name] = type;
        typeStore.set({ ...typeState });
      },
    };
  }, [typeState]);

  return {
    state: typeState,
    actions,
  };
};

// EDIT
// show the type state
// allow editing?
// keep nodes in memory first version
// save back to types branch

// CREATE NEW
// on base node -> allow import from file -> which opens this dialog

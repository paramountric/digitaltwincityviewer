import ObjectLoader from '@speckle/objectloader';
//import Converter from './Converter';
import { Node } from '@paramountric/entity';
import { Type } from '../hooks/types';
// import objectsDump from '../hooks/objects.json';

//const objectsArray = objectsDump as any[];

// function downloadObjectAsJson(exportObj: any, exportName: string) {
//   var dataStr =
//     'data:text/json;charset=utf-8,' +
//     encodeURIComponent(JSON.stringify(exportObj));
//   var downloadAnchorNode = document.createElement('a');
//   downloadAnchorNode.setAttribute('href', dataStr);
//   downloadAnchorNode.setAttribute('download', exportName + '.json');
//   document.body.appendChild(downloadAnchorNode); // required for firefox
//   downloadAnchorNode.click();
//   downloadAnchorNode.remove();
// }

// each loader wrapper will cache the nodes and nodeType groups. Note that the loader will also cache the object data
export default class BucketObjectLoader {
  serverUrl: string;
  streamId: string;
  commitId: string;
  objectId: string;
  loader: any;
  //converter: Converter;
  loadingProgress: number;
  nodeMap: {
    [objectId: string]: Node;
  };
  typeMap: {
    [typeId: string]: Type;
  };
  // data on base object
  refData: any;
  // groupMap: {
  //   [type: string]: Node;
  // };
  rootObject?: Node | null;

  // each bucket will have an object reference on the commit
  constructor(
    streamId: string,
    commitId: string,
    objectId: string,
    token: string
  ) {
    console.log(
      'load bucket (stream, commit, object)',
      streamId,
      commitId,
      objectId
    );
    this.serverUrl = 'https://speckle.pmtric.com';
    this.streamId = streamId;
    this.commitId = commitId;
    this.objectId = objectId;
    this.nodeMap = {};
    this.typeMap = {};
    this.refData = {};
    //this.groupMap = {};
    this.loadingProgress = 0;

    this.loader = new ObjectLoader({
      serverUrl: this.serverUrl,
      token,
      streamId: this.streamId,
      objectId: this.objectId,
      options: { enableCaching: true },
    });

    //this.converter = new Converter(this.loader);
  }

  createTypeFromObject(object: any) {
    //console.log('type object', object);
    const { id, name, schema, description, createdAt, updatedAt } = object;
    return {
      id,
      name,
      description,
      schema,
      createdAt,
      updatedAt,
      streamId: this.streamId,
      commitId: this.commitId,
    };
  }

  // todo: remove grouping here, grouping must be later in the pipeline
  createNodeFromObject(object: any) {
    //console.log(object);
    const objectData: any = {
      commitId: this.commitId,
      streamId: this.streamId,
      parentId: this.objectId,
    };
    if (this.refData[object.id]) {
      Object.assign(objectData, this.refData[object.id]);
    }
    if (object.name || object.Name || object.id) {
      objectData.name = object.name || object.Name || object.id;
    }
    // ! do NOT try to find the type - the type key must be used and instead offer to clean the typ
    // since the type is number sometimes, use the name (which happens to be more of a type in that case)
    //let type = Number.isInteger(object.type) ? objectData.name : object.type;

    if (object.description || object.Description) {
      objectData.description = object.description || object.Description;
    }
    // if (!type && objectData.class) {
    //   type = objectData.class;
    // }
    // if (!type && object.speckle_type) {
    //   const splits = object.speckle_type.split('.');
    //   type = splits[splits.length - 1];
    // }
    if (object.speckle_type === 'Speckle.Core.Models.DataChunk') {
      // todo: collect data
      return null;
    }
    if (object.tag || object.Tag) {
      objectData.tag = object.tag || object.Tag;
    }
    if (object.speckle_type) {
      objectData.speckleType = object.speckle_type;
    }
    // not to confuse with basebucket base
    if (object.speckle_type === 'Base') {
      const refData: {
        [refId: string]: any;
      } = {};
      for (const key of Object.keys(object)) {
        if (key.startsWith('@{')) {
          const value = object[key];
          const ref = value[0];
          if (value)
            try {
              const data = JSON.parse(value[1]);
              refData[ref.referencedId] = data;
            } catch (err) {
              console.log(err);
            }
        }
      }
      console.log(refData);
      this.refData = refData;
      // dont add base as node
      return null;
    }
    // const types = [type];
    // if (object.speckle_type) {
    //   types.push(object.speckle_type);
    // }
    return new Node({
      id: object.id,
      type: 'Entity',
      // dont do magic here, let the users decide the types
      types: [objectData.type || 'NoType'],
      data: objectData,
      collisionRadius: 10,
    });
  }

  // objects are loaded, first object is added as rootObject
  // rootObject should contain children that are put in nodeMap
  // if object has a schema, it is put in typeMap
  async load(loadingProgress?: (progress: number) => void) {
    let first = true;
    let current = 0;
    let total = 0;
    for await (const object of this.loader.getObjectIterator()) {
      //for await (const object of objectsArray) {
      if (object.schema) {
        this.typeMap[object.id] = this.createTypeFromObject(object);
        first = false;
        total = object.totalChildrenCount;
      } else if (first) {
        this.rootObject = this.createNodeFromObject(object);
        first = false;
        total = object.totalChildrenCount;
        console.log(this.rootObject);
        // not sure if single objects should be added as nodes...
        if (this.rootObject && total === 1) {
          this.nodeMap[object.id] = this.rootObject;
        }
      } else {
        // const type = object.type ? `${object.type}` : 'notype';
        // if (!this.groupMap[type]) {
        //   this.groupMap[type] = this.createNodeFromObject(object);
        // }
        const node = this.createNodeFromObject(object);
        if (node) {
          this.nodeMap[object.id] = node;
        } else {
          //console.log('object was not added as node', object)
        }
      }
      current++;
      this.loadingProgress = current / (total + 1);
      if (loadingProgress) {
        loadingProgress(this.loadingProgress);
      }
    }
  }

  // async load() {
  //   let first = true;
  //   let current = 0;
  //   let total = 0;
  //   let viewerLoads = 0;
  //   let firstObjectPromise = null;
  //   const parsedObjects: any = []; // Temporary until refactor
  //   for await (const obj of this.loader.getObjectIterator()) {
  //     await this.converter.asyncPause();
  //     if (first) {
  //       // console.log(obj)
  //       firstObjectPromise = this.converter.traverseAndConvert(
  //         obj,
  //         async objectWrapper => {
  //           if (objectWrapper) {
  //             await this.converter.asyncPause();
  //             //objectWrapper.meta.__importedUrl = this.objectUrl;
  //             this.nodeMap[obj.id] = this.createNodeFromObject(obj);
  //             parsedObjects.push(objectWrapper); // Temporary until refactor
  //             viewerLoads++;
  //           }
  //         }
  //       );
  //       first = false;
  //       total = obj.totalChildrenCount;
  //     }
  //     current++;
  //   }

  //   if (firstObjectPromise) {
  //     await firstObjectPromise;
  //   }
  //}
}

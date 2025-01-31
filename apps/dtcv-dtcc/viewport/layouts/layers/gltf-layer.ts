import { ScenegraphLayer, ScenegraphLayerProps } from "@deck.gl/mesh-layers";
import { Layout } from "../layout";
import { Feature } from "@/viewport/feature";

interface IGltfLayer {
  features: Feature[];
  layout: Layout;
}

export function createGltfLayers({
  features,
  layout,
}: IGltfLayer): ScenegraphLayer[] {
  const featuresWithGltf = features.filter(
    (f: Feature) => f.properties?._gltfUrl
  );

  const updateTriggers = {
    getPosition: layout.updateTriggers.nodePositionChange,
    getScale: layout.updateTriggers.nodeScaleChange,
    getOrientation: layout.updateTriggers.nodeRotateChange,
  };

  const scenegraphPropsMap = new Map<string, ScenegraphLayerProps<Feature>>();
  featuresWithGltf.forEach((f: Feature) => {
    const asset3dUrl = f.properties!._gltfUrl!;
    if (!scenegraphPropsMap.has(asset3dUrl)) {
      scenegraphPropsMap.set(asset3dUrl, {
        id: layout.getLayerId(asset3dUrl),
        data: [] as Feature[],
        // @ts-ignore
        // material: false,
        // @ts-ignore
        // texture: null,
        // visible: true, // layout.isTilted(),
        _animations: {
          "*": { speed: 1 },
        },
        _lighting: "pbr",
        pickable: true,
        scenegraph: asset3dUrl,
        sizeScale: 1,
        parameters: {
          depthWriteEnabled: true,
          depthCompare: "less",
          cullMode: "none", // Changed from 'back' to 'none' to show both sides
          //   frontFace: "ccw",
          //   blend: true,
          //   blendColorSrcFactor: "src-alpha",
          //   blendColorDstFactor: "one-minus-src-alpha",
          polygonMode: "fill",
        },
        getPosition: (n: Feature) => {
          const position = n.properties?._position || [0, 0, 0];
          return [position[0], position[1], 0];
        },
        getScale: (n: Feature) => {
          // the 3d asset must be normalized to 1x1x1
          const size = n.properties?._size || [1, 1, 1];
          const scale = n.properties?._scale || [1, 1, 1];
          return [
            size[0] * scale[0],
            size[1] * scale[1],
            size[2] || 1 * scale[2],
          ];
        },
        // Object orientation defined as a vec3 of Euler angles, [pitch, yaw, roll] in degrees. This will be composed with layer's modelMatrix.
        getOrientation: (n: Feature) => {
          return n.properties?._rotation || [0, 0, 0];
        },
        getColor: (n: Feature) => {
          // You can get color from feature properties or use a default
          return n.properties?._fillColor || [255, 255, 255, 255];
        },
        // Add color to update triggers
        updateTriggers: {
          ...updateTriggers,
          getColor: layout.updateTriggers.nodeColorChange, // Add this if you have a color trigger
        },
      });
    }
    const scenegraphProps = scenegraphPropsMap.get(asset3dUrl);
    // @ts-ignore
    scenegraphProps.data.push(f);
  });

  return [...scenegraphPropsMap.values()].map((scenegraphProps) => {
    return new ScenegraphLayer(scenegraphProps);
  });
}

// export function createGltfLayer({
//   features,
//   layout,
// }: IGltfLayer): ScenegraphLayer[] {
//   const feature = features[0];

//   if (!feature) {
//     return [];
//   }

//   const url = feature.properties!._gltfUrl;

//   if (!url) {
//     return [];
//   }

//   const scenegraphProps: ScenegraphLayerProps<Feature> = {
//     id: layout.getLayerId(url),
//     data: [feature] as Feature[],
//     _animations: {
//       "*": { speed: 1 },
//     },
//     _lighting: "pbr",
//     pickable: true,
//     scenegraph: url,
//     sizeScale: 1,
//     parameters: {
//       depthWriteEnabled: true, // Enable depth writing
//       depthCompare: "less", // Standard depth testing
//       cullMode: "back", // Cull back faces
//       frontFace: "ccw", // Counter-clockwise front face
//       blend: true, // Enable blending for transparency
//       blendColorSrcFactor: "src-alpha",
//       blendColorDstFactor: "one-minus-src-alpha",
//       polygonMode: "fill", // Render as solid
//     },
//     getPosition: (f: Feature) => {
//       // Start with origin, adjust if needed
//       return [0, 0, 0];
//     },
//     getScale: (f: Feature) => {
//       // Try different scales to make the model visible
//       return url.includes("building") ? [10, 10, 10] : [1, 1, 1];
//     },
//     getOrientation: (f: Feature) => {
//       // Buildings often need to be rotated to align with ground
//       return [0, 0, 0];
//     },
//   };

//   return [new ScenegraphLayer(scenegraphProps)];
// }

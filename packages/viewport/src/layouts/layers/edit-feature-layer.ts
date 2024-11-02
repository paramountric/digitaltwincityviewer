import {
  EditableGeoJsonLayer,
  DrawPolygonMode,
} from '@deck.gl-community/editable-layers';
import { Layout } from '../layout';
import { Feature } from '../..';
import { InteractionManager } from '../../lib/interaction-manager';

interface IEditFeatureLayer {
  features: Feature[];
  selectedFeatureIndexes: number[];
  layout: Layout;
  interactionManager: InteractionManager;
}

export function getEditFeatureLayer({
  features,
  selectedFeatureIndexes,
  interactionManager,
  layout,
}: IEditFeatureLayer) {
  const layers = [];

  const editableGeoJsonLayer = new EditableGeoJsonLayer({
    id: layout.getLayerId('edit-feature-layer'),
    data: {
      type: 'FeatureCollection',
      features: features as any,
    },
    mode: interactionManager.interactionState.editMode,
    selectedFeatureIndexes,
    getTentativeLineColor: () => [255, 0, 0, 255],
    getTentativeFillColor: () => [128, 0, 0, 255],
    getTentativeLineWidth: () => 2,
    onEdit: event => {
      //   console.log(event);
    },
  });

  layers.push(editableGeoJsonLayer);

  return layers;
}

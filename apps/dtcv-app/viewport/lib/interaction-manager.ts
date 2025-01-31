import { InteractionState } from '@deck.gl/core';
import { Viewport } from '../viewport';
import {
  DrawPolygonMode,
  DrawPointMode,
  DrawLineStringMode,
  ViewMode,
} from '@deck.gl-community/editable-layers';

// // Alter modes
// export {ModifyMode} from './edit-modes/modify-mode';
// export {ResizeCircleMode} from './edit-modes/resize-circle-mode';
// export {TranslateMode} from './edit-modes/translate-mode';
// export {ScaleMode} from './edit-modes/scale-mode';
// export {RotateMode} from './edit-modes/rotate-mode';
// export {DuplicateMode} from './edit-modes/duplicate-mode';
// export {ExtendLineStringMode} from './edit-modes/extend-line-string-mode';
// export {SplitPolygonMode} from './edit-modes/split-polygon-mode';
// export {ExtrudeMode} from './edit-modes/extrude-mode';
// export {ElevationMode} from './edit-modes/elevation-mode';
// export {TransformMode} from './edit-modes/transform-mode';

// // Draw modes
// export {DrawPointMode} from './edit-modes/draw-point-mode';
// export {DrawLineStringMode} from './edit-modes/draw-line-string-mode';
// export {DrawPolygonMode} from './edit-modes/draw-polygon-mode';
// export {DrawRectangleMode} from './edit-modes/draw-rectangle-mode';
// export {DrawSquareMode} from './edit-modes/draw-square-mode';
// export {DrawRectangleFromCenterMode} from './edit-modes/draw-rectangle-from-center-mode';
// export {DrawSquareFromCenterMode} from './edit-modes/draw-square-from-center-mode';
// export {DrawCircleByDiameterMode} from './edit-modes/draw-circle-by-diameter-mode';
// export {DrawCircleFromCenterMode} from './edit-modes/draw-circle-from-center-mode';
// export {DrawEllipseByBoundingBoxMode} from './edit-modes/draw-ellipse-by-bounding-box-mode';
// export {DrawEllipseUsingThreePointsMode} from './edit-modes/draw-ellipse-using-three-points-mode';
// export {DrawRectangleUsingThreePointsMode} from './edit-modes/draw-rectangle-using-three-points-mode';
// export {Draw90DegreePolygonMode} from './edit-modes/draw-90degree-polygon-mode';
// export {DrawPolygonByDraggingMode} from './edit-modes/draw-polygon-by-dragging-mode';
// export {ImmutableFeatureCollection} from './edit-modes/immutable-feature-collection';

// // Other modes
// export {ViewMode} from './edit-modes/view-mode';
// export {MeasureDistanceMode} from './edit-modes/measure-distance-mode';
// export {MeasureAreaMode} from './edit-modes/measure-area-mode';
// export {MeasureAngleMode} from './edit-modes/measure-angle-mode';
// export {CompositeMode} from './edit-modes/composite-mode';
// export {SnappableMode} from './edit-modes/snappable-mode';

export type ViewportInteractionState = InteractionState & {
  editMode: DrawPolygonMode | DrawPointMode | DrawLineStringMode | ViewMode;
};

export class InteractionManager {
  viewport: Viewport;
  interactionState: ViewportInteractionState;

  constructor({ viewport }: { viewport: Viewport }) {
    this.viewport = viewport;
    this.getCursor = this.getCursor.bind(this);
    this.interactionState = {
      editMode: new ViewMode(),
    };
  }

  getCursor(cursorState) {
    switch (true) {
      case this.interactionState.editMode instanceof DrawPolygonMode:
        return 'crosshair';
      case this.interactionState.editMode instanceof DrawPointMode:
        return 'crosshair';
      case this.interactionState.editMode instanceof DrawLineStringMode:
        return 'crosshair';
    }
    if (cursorState.isDragging) {
      return 'grabbing';
    } else if (cursorState.isHovering) {
      return 'pointer';
    }
    return 'grab';
  }
}

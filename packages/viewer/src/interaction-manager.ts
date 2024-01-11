import { Viewer } from './viewer';

type InteractionManagerProps = {
  viewer: Viewer;
};

export class InteractionManager {
  viewer: Viewer;
  constructor({ viewer }: InteractionManagerProps) {
    this.viewer = viewer;
    this.onInteractionStateChange = this.onInteractionStateChange.bind(this);
  }
  getCursor({
    isDragging,
    isHovering,
  }: {
    isDragging: boolean;
    isHovering: boolean;
  }) {
    if (isDragging) {
      return 'grabbing';
    }
    return 'grab';
  }
  onInteractionStateChange = (interactionState: any) => {};
}

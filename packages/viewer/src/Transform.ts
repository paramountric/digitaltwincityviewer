import { ViewerProps } from './Viewer';

export class Transform {
  constructor(viewerProps: ViewerProps) {
    console.log('init transform');
  }
  update(viewerProps: ViewerProps) {
    console.log('update transform');
  }
}

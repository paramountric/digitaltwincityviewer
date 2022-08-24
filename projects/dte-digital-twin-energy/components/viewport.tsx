import {useRef, useState, useEffect} from 'react';
import {Viewer as ViewerModule} from '@dtcv/viewer';

type ViewerProps = {};

const Viewer: React.FC<ViewerProps> = () => {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<ViewerModule | null>(null);
  useEffect(() => {
    console.log('init canvas');
    const viewer = new ViewerModule();
  });
  return (
    <canvas
      id="canvas-1"
      style={{background: '#eee', width: '100%', height: '400px'}}
      ref={canvasRef1}
    ></canvas>
  );
};

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  return (
    <>
      <Viewer></Viewer>
    </>
  );
};

export default Viewport;

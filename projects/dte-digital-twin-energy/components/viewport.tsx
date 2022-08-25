import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/viewer';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {initViewer} = useViewer();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, []);

  return (
    <canvas
      id="canvas-1"
      style={{background: '#eee', width: '100%', height: '400px'}}
      ref={canvasRef}
    ></canvas>
  );
};

export default Viewport;

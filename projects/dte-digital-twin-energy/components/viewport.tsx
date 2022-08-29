import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/viewer';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLElement>(null);
  const {initViewer} = useViewer();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, [initViewer]);

  return (
    <div
      id="viewport"
      style={{background: '#eee', width: '100%', height: '400px'}}
      ref={canvasRef}
    ></div>
  );
};

export default Viewport;

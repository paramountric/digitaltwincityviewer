import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/viewer';
import Legend from './legend';
import ActionPanel from './action-panel';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {initViewer} = useViewer();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, [initViewer]);

  return (
    <>
      <ActionPanel></ActionPanel>
      <div
        id="viewport"
        style={{background: '#eee', width: '100%', height: '400px'}}
        ref={canvasRef}
      ></div>
      <Legend></Legend>
    </>
  );
};

export default Viewport;

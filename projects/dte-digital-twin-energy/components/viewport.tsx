import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/viewer';
import {useSelectedFeature} from '../hooks/selected-feature';
import Legend from './legend';
import ActionPanel from './action-panel';
import RightMenu from './right-menu';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {initViewer} = useViewer();
  const {state: selectedFeatureId} = useSelectedFeature();

  console.log(selectedFeatureId);

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
      {selectedFeatureId && (
        <RightMenu selectedFeatureId={selectedFeatureId}></RightMenu>
      )}
      <Legend></Legend>
    </>
  );
};

export default Viewport;

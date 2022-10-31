import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/viewer';
import {useSelectedFeature} from '../hooks/selected-feature';
import ActionPanel from './action-panel';
import RightMenu from './right-menu';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {initViewer} = useViewer();
  const {state: selectedFeatureId} = useSelectedFeature();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, [initViewer]);

  const isLoading = true;

  return (
    <>
      <ActionPanel></ActionPanel>
      {isLoading ? (
        <div className="absolute z-10 w-full h-full">
          <div className="relative flex justify-center items-center h-screen">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        </div>
      ) : null}
      <div
        id="viewport"
        style={{background: '#eee', width: '100%', height: '400px'}}
        ref={canvasRef}
      ></div>
      {selectedFeatureId && (
        <RightMenu selectedFeatureId={selectedFeatureId}></RightMenu>
      )}
    </>
  );
};

export default Viewport;

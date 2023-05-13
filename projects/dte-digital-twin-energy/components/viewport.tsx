import { useRef, useState, useEffect } from 'react';
import { useViewer } from '../hooks/use-viewer';
import { useUi } from '../hooks/use-ui';
import { useSelectedFeature } from '../hooks/use-selected-feature';
import Legend from './legend';
import ActionPanel from './action-panel';
import FilterMenu from './filter-menu';
import BottomPanel from './bottom-panel';
import LeftMenu from './left-menu';
import InfoMenu from './info-menu';
// import {
//   useClimateScenarioData,
//   useContextData,
//   useBaseMapData,
// } from '../hooks/data';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { initViewer } = useViewer();
  const { combinationIsSelected } = useUi();
  const { state: selectedFeatureId } = useSelectedFeature();
  // const climateScenarioData = useClimateScenarioData();
  // const contextData = useContextData();
  // const baseMapData = useBaseMapData();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, [initViewer]);

  return (
    <>
      <ActionPanel></ActionPanel>
      {false ? (
        <div className="absolute z-10 w-full h-full">
          <div className="relative flex justify-center items-center h-screen">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        </div>
      ) : null}
      <div
        id="viewport"
        style={{ background: '#eee', width: '100%', height: '400px' }}
        ref={canvasRef}
      ></div>
      <LeftMenu />
      {/* {selectedFeatureId && <RightMenu></RightMenu>} */}
      <FilterMenu />
      <InfoMenu />
      {combinationIsSelected() && <Legend></Legend>}
    </>
  );
};

export default Viewport;

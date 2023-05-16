import { useRef, useEffect } from 'react';
import { useViewer } from '../../hooks/use-viewer';
import { useUi } from '../../hooks/use-ui';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import Legend from '../Legend/Legend';
import FilterMenu from '../FilterMenu/FilterMenu';
import BottomPanel from '../BottomPanel';
import LeftMenu from '../LeftMenu/LeftMenu';
import InfoMenu from '../InfoMenu/InfoMenu';
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
      {/* <ActionPanel /> */}
      {false ? (
        <div className="absolute z-10 w-full h-full">
          <div className="relative flex items-center justify-center h-screen">
            <div className="w-32 h-32 ease-linear border-8 border-t-8 border-gray-200 rounded-full loader"></div>
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
      {combinationIsSelected() && <Legend />}
    </>
  );
};

export default Viewport;

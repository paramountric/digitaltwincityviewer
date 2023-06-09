import { useRef, useEffect } from 'react';
import { useViewer } from '../../hooks/use-viewer';
import { useUi } from '../../hooks/use-ui';
// import { useSelectedFeature } from '../../hooks/use-selected-feature';
import Legend from '../Legend/Legend';
import FilterMenu from '../FilterMenu/FilterMenu';
import InfoModal from '../InfoMenu/InfoModal';
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
  const {
    state: { showScenario, showInfoModal },
  } = useUi();
  // const { state: selectedFeatureId } = useSelectedFeature();
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
      <div
        id="viewport"
        style={{ background: '#eee', width: '100%', height: '400px' }}
        ref={canvasRef}
      ></div>
      <LeftMenu />
      <FilterMenu />
      <InfoMenu />
      <InfoModal />
      {showScenario && <Legend />}
    </>
  );
};

export default Viewport;

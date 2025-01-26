import {useRef, useState, useEffect} from 'react';
import {useViewer} from '../hooks/use-viewer';
import {LayerConfig, useLayers} from '../hooks/use-layers';
import {useUi, cityDatasets} from '../hooks/use-ui';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    actions: {initViewer},
  } = useViewer();
  const {
    state,
    actions: {setIsLoading},
  } = useUi();
  const {
    state: viewerState,
    actions: {setCity, setCenter, setActiveDataSet},
  } = useViewer();
  const {
    actions: {loadLayer, addLayer, resetLayers},
  } = useLayers();
  const {actions: layerActions} = useLayers();

  const handleLoadExample = async (layerConfig: LayerConfig) => {
    const {id, cityId, layerType, lng, lat} = layerConfig;
    if (cityId !== viewerState.activeDataSetId) {
      resetLayers();
    }
    setCity(cityId);
    // setCenter(lng, lat);
    // setActiveDataSet(cityId);
    // setIsLoading(true);
    // const result = await loadLayer(layerConfig);
    // console.log(result);
    // addLayer({
    //   ...result,
    //   id,
    //   '@@type': layerType,
    // });
    setIsLoading(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.top = '0px';
      containerRef.current.style.left = '0px';
      initViewer(containerRef.current, () => {
        handleLoadExample(cityDatasets.malmo.layerConfigs[0]);
      });
    }
  }, [initViewer]);

  return (
    <>
      <div id="viewport" ref={containerRef}></div>
    </>
  );
};

export default Viewport;

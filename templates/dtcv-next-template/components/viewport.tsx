import {useRef, useEffect, useMemo} from 'react';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {actions: viewerActions} = useViewer();
  const {actions: layerActons} = useLayers();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.top = '0px';
      containerRef.current.style.left = '0px';
      viewerActions.initViewer(containerRef.current);
      // Add data when it is loaded, this is just an example triggered immediately
      layerActons.addLayer({
        '@@type': 'PoiLayer',
        id: 'test',
        data: [
          {
            name: 'Test point',
            coordinates: [0, 0],
          },
        ],
      });
    }
  }, []);

  return (
    <>
      <div id="viewport" ref={containerRef}></div>
    </>
  );
};

export default Viewport;

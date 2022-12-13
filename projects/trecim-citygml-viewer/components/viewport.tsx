import {useRef, useEffect, useMemo} from 'react';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {actions: viewerActions} = useViewer();
  const {actions: layerActions} = useLayers();

  useEffect(() => {
    if (containerRef.current) {
      console.log('init');
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.top = '0px';
      containerRef.current.style.left = '0px';
      viewerActions.initViewer(containerRef.current);
      // Use this layer for testing that rendering work (for the Helsingborg example data, or change the coordinate)
      // layerActions.addLayer({
      //   '@@type': 'PoiLayer',
      //   id: 'test',
      //   data: [
      //     {
      //       name: 'Test point',
      //       coordinates: [12.7401827, 56.0430155],
      //     },
      //   ],
      // });
    }
  }, []);

  return (
    <>
      <div id="viewport" ref={containerRef}></div>
    </>
  );
};

export default Viewport;

import {useRef, useEffect, useMemo} from 'react';
import {useViewer} from '../hooks/use-viewer';
import {DataLoader} from '../lib/DataLoader';

type ViewportProps = {
  data: any;
};

const Viewport: React.FC<ViewportProps> = ({data}) => {
  console.log(data);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {viewerActions} = useViewer();

  useEffect(() => {
    const dataLoader = new DataLoader();
    (async () => {
      for (const file of data.files) {
        const loader = await dataLoader.getLoader(file);
        if (loader) {
          const data = await dataLoader.load(loader, file);
          console.log(data);
        }
      }
    })();
  }, [data]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.width = '100%';
      canvasRef.current.style.height = '100%';
      canvasRef.current.style.position = 'absolute';
      canvasRef.current.style.top = '0px';
      canvasRef.current.style.left = '0px';
      viewerActions.initViewer(canvasRef.current);
    }
  }, []);

  return (
    <>
      <canvas id="viewport" ref={canvasRef}></canvas>
    </>
  );
};

export default Viewport;

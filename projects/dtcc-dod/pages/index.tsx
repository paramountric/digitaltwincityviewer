import type {NextPage} from 'next';
import {useRef, useState, useEffect} from 'react';
import Head from 'next/head';
import {Viewer} from '@dtcv/viewer';

const StartPage: NextPage = () => {
  const canvasRef1 = useRef(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  useEffect(() => {
    if (canvasRef1.current && !viewer) {
      console.log('init canvas');
      setViewer(
        new Viewer({
          canvas: canvasRef1.current,
          width: '100%',
          height: '100%',
        })
      );
    }
  }, [viewer]);
  return (
    <div>
      <Head>
        <title>DoD - Design och Data</title>
        <meta
          name="description"
          content="DoD is a project about built environment design process interoperability in digital twins"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <div className="absolute z-50 overflow-hidden">
          {/* Header */}
          <div className="w-full bg-slate-100">Header</div>
          {/* App menu */}
          <div className="w-full bg-slate-100">
            <button onClick={() => {}} className="p-3 border-full bg-slate-100">
              Login
            </button>
          </div>
        </div>

        <canvas
          id="canvas-1"
          style={{background: '#eee', width: '100%', height: '400px'}}
          ref={canvasRef1}
        ></canvas>
      </main>
    </div>
  );
};

export default StartPage;

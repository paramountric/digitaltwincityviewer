import type {NextPage} from 'next';
import {useRef, useState, useEffect, useCallback} from 'react';
import Header from '../components/Header';
import Viewport from '../components/Viewport';

const ViewerPage: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <div className="absolute z-50 overflow-hidden">
          <Header title="Design och Data" />
        </div>

        <Viewport />
      </main>
    </div>
  );
};

export default ViewerPage;

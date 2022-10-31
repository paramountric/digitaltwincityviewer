import {useState, useEffect, useCallback} from 'react';
import {Viewer, JsonProps} from '@dtcv/viewer';
import {cities} from '@dtcv/cities';
import {Feature} from '@dtcv/geojson';
import {useUser} from './user';
import {useSelectedFeature} from './selected-feature';
import {getColorFromScale} from '../lib/colorScales';

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

const maplibreOptions = {
  longitude: gothenburg.lng,
  latitude: 57.7927,
};

export const useViewer = (): {
  initViewer: (ref: HTMLElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
  getVisibleFeatures: () => Feature[];
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [extent, setExtent] = useState<number[]>([]);

  const {user} = useUser();
  const {actions} = useSelectedFeature();

  // const updateTimeline = () => {
  //   console.log('test', viewer, propertyKey, selectedYear);
  //   if (!viewer || !propertyKey || !selectedYear) {
  //     return;
  //   }
  //   const visibleObjects = ;
  //   const timelineData = getTimelineData(visibleObjects);
  //   console.log(timelineData);
  // };

  const render = () => {
    if (!viewer) {
      return;
    }
    const jsonData: JsonProps = {
      layers: [],
    };

    viewer.setJson(jsonData);
  };

  useEffect(() => {
    render();
  }, [viewer]);

  useEffect(() => {
    // check user
  }, [user]);

  return {
    initViewer: ref => {
      if (viewer) {
        return;
      }
      ref.style.width = '100%';
      ref.style.height = '100%';
      ref.style.position = 'absolute';
      ref.style.top = '0px';
      ref.style.left = '0px';
      //ref.style.background = '#100';
      setViewer(
        new Viewer(
          {
            container: ref,
            onDragEnd: ({longitude, latitude, zoom}: any) => {
              setExtent([longitude, latitude, zoom]);
            },
          },
          maplibreOptions
        )
      );
    },
    viewer,
    viewerLoading: false,
    getVisibleFeatures: () => {
      if (viewer) {
        return viewer.getVisibleObjects(['bsm-layer']);
      }
      return [];
    },
  };
};

import {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {useUi} from '../hooks/use-ui';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';
import {loadExampleData, cityDatasets, DataSet} from '../lib/load-example';

export default function LoadCityDialog() {
  const {
    state,
    actions: {setShowLoadCityDialog, setIsLoading},
  } = useUi();
  const {
    state: viewerState,
    actions: {setCity, setMapCenter, setOffsetCenter, setActiveDataSet},
  } = useViewer();
  const {
    actions: {addLayer, addLayers, resetLayers, setLayerElevation},
  } = useLayers();

  const handleLoadExample = async (fileSetting: DataSet, cityDatasetKey) => {
    // this is because state is divided into layers and viewer, not sure if they should better go into same state
    // the two states needs to communicate through the component to avoid dependencies between hooks
    if (cityDatasetKey !== viewerState.activeDataSetId) {
      resetLayers();
    }
    const {id, cityId, fileType, layerType, layerElevation} = fileSetting;
    setIsLoading(true);
    // ! note that the loading is done in left menu as well
    if (fileType === 'citygml') {
      // todo: refactor the callbacks to promises, this is due to the xml parser lib
      await loadExampleData(
        fileSetting,
        (layerDataArray, lngLatAlt) => {
          const [lng, lat] = lngLatAlt;
          // the idea that the city could contain metadata from the cityId
          setCity(cityId);
          // the map moves to this position
          setMapCenter(lng, lat);
          // the next layer will use this x and y for the offsetting
          setOffsetCenter(lngLatAlt);
          // the dataset can be several in the same city, so a reload could be needed (this is managed by the list of datasets)
          setActiveDataSet(cityDatasetKey);
          // since a citygml file could contain many layers
          addLayers(layerDataArray);
          // hack to adjust the layer elevation since the z is messed up
          setLayerElevation(id, layerElevation);

          // test layer
          // addLayer({
          //   '@@type': 'PoiLayer',
          //   id: 'test',
          //   coordinateOrigin: [lng, lat, 0],
          //   coordinateSystem: 2,
          //   data: [
          //     {
          //       name: 'Test point',
          //       coordinates: [0, 0],
          //     },
          //   ],
          // });

          setIsLoading(false);
          setShowLoadCityDialog(false);
        },
        cityDatasetKey === viewerState.activeDataSetId
          ? viewerState.offsetCenter
          : null
      );
    } else {
      const result = await loadExampleData(fileSetting, layerData => {
        addLayer({
          ...layerData,
          id,
          '@@type': layerType,
        });

        setIsLoading(false);
        setShowLoadCityDialog(false);
      });
      addLayer({
        ...result,
        id,
        '@@type': layerType,
      });

      setIsLoading(false);
      setShowLoadCityDialog(false);
    }
  };

  return (
    <Transition.Root show={state.showLoadCityDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-30"
        onClose={() => setShowLoadCityDialog(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="md:max-w-7xl md:mx-10 relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 hover:ring-1 hover:ring-gray-400 focus:outline-none"
                    onClick={() => setShowLoadCityDialog(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Load example
                </Dialog.Title>
                <nav className="h-full overflow-y-auto mt-8">
                  {Object.keys(cityDatasets).map(cityDatasetKey => {
                    const dataset = cityDatasets[cityDatasetKey];
                    return (
                      <div key={cityDatasetKey} className="relative">
                        <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
                          <h3>{dataset.cityLabel}</h3>
                        </div>
                        <ul
                          role="list"
                          className="relative z-0 divide-y divide-gray-200"
                        >
                          {Object.keys(dataset.files).map(fileKey => (
                            <li
                              key={dataset.files[fileKey].id}
                              className="bg-white"
                            >
                              <div
                                onClick={() =>
                                  handleLoadExample(
                                    dataset.files[fileKey],
                                    cityDatasetKey
                                  )
                                }
                                className="relative flex items-center space-x-3 px-6 py-5 hover:bg-gray-50"
                              >
                                {/* <div className="flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={dataset.files[fileKey].imageUrl}
                                    alt=""
                                  />
                                </div> */}
                                <div className="min-w-0 flex-1">
                                  <a href="#" className="focus:outline-none">
                                    <span
                                      className="absolute inset-0"
                                      aria-hidden="true"
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                      {dataset.files[fileKey].text}
                                    </p>
                                    <p className="truncate text-sm text-gray-500">
                                      {dataset.files[fileKey].pbType}
                                    </p>
                                  </a>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

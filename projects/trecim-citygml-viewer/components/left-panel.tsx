import {Disclosure} from '@headlessui/react';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';
import {useUi} from '../hooks/use-ui';
import {loadExampleData, cityDatasets} from '../lib/load-example';
import LayerIcon from '../assets/layer-icon';
import ShowOneLayer from '../assets/show-one-layer';
import LayersForward from '../assets/layers-forward';
import VisibilityOffIcon from '../assets/visibility-off-icon';
import VisibilityOnIcon from '../assets/visibility-on-icon';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LeftPanel() {
  const {
    state: viewerState,
    actions: {getCity},
  } = useViewer();
  const {
    actions: {
      addLayer,
      addLayers,
      setLayerVisibility,
      getLayerVisibility,
      getLayerState,
      setLayerElevation,
    },
  } = useLayers();
  const {
    state,
    actions: {setShowLoadCityDialog, setIsLoading},
  } = useUi();

  if (!viewerState.viewer) {
    return null;
  }
  const currentCity = getCity();

  if (!currentCity) {
    return null;
  }

  const cityDataset = cityDatasets[viewerState.activeDataSetId] || {};
  const cityFiles = cityDataset.files || [];

  //const layerState = getLayerState();

  const menuItems = [
    {
      name: 'Lager',
      icon: LayerIcon,
      current: false,
      children: cityFiles.map(fileSetting => {
        // get any existing layer state from the hook
        // if several sublayers are used, use the first since all sublayers will have the same visibility and elevation

        const visible = getLayerVisibility(fileSetting.id);

        console.log('visible', fileSetting.id, visible);

        return {...fileSetting, visible, icon: ShowOneLayer};
      }),
    },
  ];

  // used for the currently disabled elevation control
  // const visibleLayers = layerState.filter(l => l.visible);

  const handleClickLoadFile = async fileSetting => {
    setIsLoading(true);

    const {id, layerElevation, layerType, fileType} = fileSetting;
    const visible = getLayerVisibility(fileSetting.id);

    // if already loaded, toggle visibility
    if (visible) {
      setLayerVisibility(fileSetting.id, false);
      setIsLoading(false);
      return;
    } else if (visible === false) {
      setLayerVisibility(fileSetting.id, true);
      setIsLoading(false);
      return;
    }

    // not loaded, -> load layer data
    // ! note that the loading is done in dialog as well
    if (fileType === 'citygml') {
      // todo: refactor the callbacks to promises, this is due to the xml parser lib
      await loadExampleData(
        fileSetting,
        layerDataArray => {
          addLayers(layerDataArray);
          setLayerElevation(id, layerElevation);
          setIsLoading(false);
          setShowLoadCityDialog(false);
        },
        viewerState.offsetCenter
      );
    } else {
      const result = await loadExampleData(fileSetting, layerData => {
        addLayer({
          ...layerData,
          '@@type': layerType,
        });

        setIsLoading(false);
        setShowLoadCityDialog(false);
      });
      addLayer({
        ...result,
        '@@type': layerType,
      });

      setIsLoading(false);
      setShowLoadCityDialog(false);
    }
  };

  const handleOnChangeSlider = (layerId, e) => {
    const val = Number(e.target.value);
    setLayerElevation(layerId, val);
  };

  return (
    <div className="absolute z-10">
      <div className="flex flex-grow pt-16 pb-6 h-screen flex-col overflow-y-auto border-r border-gray-200 bg-white ">
        <div className="flex flex-grow flex-col">
          <div className="text-center font-medium p-1 text-gray-600">
            {currentCity.name}
          </div>
          <div className="flex-1 space-y-1 bg-white px-2">
            {menuItems.map(item =>
              !item.children ? (
                <div key={item.name}>
                  <a
                    href="#"
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group w-full flex items-center pl-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </div>
              ) : (
                <Disclosure
                  defaultOpen
                  as="div"
                  key={item.name}
                  className="space-y-1"
                >
                  {({open}) => (
                    <>
                      <Disclosure.Button
                        className={classNames(
                          item.current
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none'
                        )}
                      >
                        <div className="mr-1">
                          <item.icon
                            className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        <svg
                          className={classNames(
                            open ? 'text-gray-400 rotate-90' : 'text-gray-300',
                            'ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400'
                          )}
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                        </svg>
                      </Disclosure.Button>
                      <Disclosure.Panel className="space-y-1">
                        {item.children.map(subItem => (
                          <Disclosure.Button
                            key={subItem.id}
                            as="a"
                            onClick={() => handleClickLoadFile(subItem)}
                            className="group flex w-full items-center justify-between rounded-md py-2 pl-4 pr-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:cursor-pointer"
                          >
                            {subItem.text}
                            {/* <div onClick={() => handleClickShowOnlyLayer(subItem)} className="ml-1">
                              <subItem.icon
                                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </div> */}
                            <div className="flex ml-1">
                              {subItem.visible ? (
                                <VisibilityOnIcon
                                  className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <VisibilityOffIcon
                                  className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )
            )}
            {/* <Disclosure as="div" key="layers-z" className="space-y-1">
              {({open}) => (
                <>
                  <Disclosure.Button className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none">
                    <div className="mr-1">
                      <LayersForward
                        className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="flex-1">Justera höjd</span>
                    <svg
                      className={classNames(
                        open ? 'text-gray-400 rotate-90' : 'text-gray-300',
                        'ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400'
                      )}
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                    </svg>
                  </Disclosure.Button>
                  <Disclosure.Panel className="space-y-1">
                    {visibleLayers.map(layer => {
                      return (
                        <div key={layer.id} className="p-2">
                          <label
                            htmlFor={layer.id}
                            className="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            {layer.text}
                          </label>
                          <input
                            id={layer.id}
                            type="range"
                            min="-100"
                            max="100"
                            value={layer.elevation}
                            onChange={e => handleOnChangeSlider(layer.id, e)}
                            className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure> */}
          </div>
        </div>
      </div>
    </div>
  );
}

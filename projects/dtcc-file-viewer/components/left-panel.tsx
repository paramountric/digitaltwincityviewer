import {Disclosure} from '@headlessui/react';
import {useViewer} from '../hooks/use-viewer';
import {useUi} from '../hooks/use-ui';
import {loadExampleData, cityDatasets} from '../lib/load-example';
import layerIcon from '../assets/layer-icon';
import showOneLayer from '../assets/show-one-layer';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LeftPanel() {
  const {
    viewerState,
    actions: {getCity, addLayer, setLayerVisibility, getLayerState},
  } = useViewer();
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

  const cityDataset = cityDatasets[currentCity.id] || {};
  const cityFiles = cityDataset.files || [];

  const layerState = getLayerState();

  const menuItems = [
    {
      name: 'Layers',
      icon: layerIcon,
      current: false,
      children: cityFiles.map(fileSetting => {
        const ls = layerState.find(l => l.id === fileSetting.id) || {};
        console.log(ls);
        return {...fileSetting, ...ls, icon: showOneLayer};
      }),
    },
  ];

  const handleClickLoadFile = async fileSetting => {
    const {id, layerType, visible} = fileSetting;

    // if already loaded, toggle visibility
    if (visible) {
      setLayerVisibility(id, false);
      return;
    } else if (visible === false) {
      setLayerVisibility(id, true);
      return;
    }

    // not loaded, -> load layer data
    setIsLoading(true);
    const {data, modelMatrix} = await loadExampleData(fileSetting);
    addLayer({
      id,
      '@@type': layerType,
      data,
      modelMatrix,
    });

    setIsLoading(false);
    setShowLoadCityDialog(false);
  };

  return (
    <div className="absolute z-40">
      <div className="flex flex-grow pt-16 pb-6 h-screen flex-col overflow-y-auto border-r border-gray-200 bg-white ">
        <div className="flex flex-grow flex-col">
          <div className="text-center font-medium p-1 text-gray-600">
            {currentCity.name}
          </div>
          <nav className="flex-1 space-y-1 bg-white px-2" aria-label="Sidebar">
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
                <Disclosure as="div" key={item.name} className="space-y-1">
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
                            className="group flex w-full items-center rounded-md py-2 pl-4 pr-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          >
                            {subItem.text}
                            {/* <div onClick={() => handleClickShowOnlyLayer(subItem)} className="ml-1">
                              <subItem.icon
                                className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </div> */}
                            {subItem.isVisible && (
                              <div className="ml-1">
                                <subItem.icon
                                  className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
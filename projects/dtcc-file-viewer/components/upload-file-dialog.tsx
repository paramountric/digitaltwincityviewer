import {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {useUi} from '../hooks/use-ui';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';
import {findCity} from '@dtcv/cities';

export default function UploadFileDialog() {
  const {
    state,
    actions: {setShowUploadFileDialog},
  } = useUi();

  const {
    actions: {setCity},
  } = useViewer();

  const {
    actions: {addLayer},
  } = useLayers();

  const [errorMsg, setErrorMsg] = useState<string>('');

  const supportedPbTypes = ['CityModel', 'Surface3D'];
  const layerMapping = ['CityModelLayer', 'GroundSurfaceLayer'];

  // This functin needs to figure out content and metadata of the pbData
  const findPbJson = pbData => {
    let pbJson;
    let idx = 0;
    let pbType;
    let layerType;
    while (!pbJson && idx < supportedPbTypes.length) {
      try {
        pbType = supportedPbTypes[idx];
        layerType = layerMapping[idx];
        pbJson = parseProtobuf(pbData, pbType);
        if (!pbJson) {
          throw new Error('Parsing error');
        }
        // These should come from the file!!
        pbJson.crs = 'EPSG:3008';
        pbJson.origin = {x: 102000, y: 6213004.15744457};

        console.log('pbjson', pbJson);
      } catch (e) {
        //
      }
      idx++;
    }
    return {pbJson, pbType, layerType};
  };

  const findCityFromPb = pbJson => {
    // todo: take the first coordinate, add origin, convert to lnglat, call the findCity function
    // const isLngLat = true;
    // const city = findCity(lng, lat, isLngLat);
    // return city.id;
    return 'helsingborg';
  };

  const addLayerFromPbData = pbData => {
    const {pbJson, pbType, layerType} = findPbJson(pbData);
    if (!pbJson) {
      setErrorMsg(
        'This type is not supported. Supported types: CityModel, Surface3D'
      );
      return;
    }
    const cityId = findCityFromPb(pbJson);
    setCity(cityId);
    const result: any = {};
    if (!pbJson) {
      console.log('handle this');
    }
    const layerData = parseCityModel(pbJson, pbJson.crs, pbType);

    switch (pbType) {
      case 'CityModel':
        result.data = layerData.buildings.data;
        //result.coordinateOrigin = [lng, lat];
        // this makes it works perfectly, but how should other layers realate?
        //result.modelMatrix = layerData.buildings.modelMatrix;
        result.pickable = true;
        result.autoHighlight = true;
        break;
      case 'Surface3D':
        result.data = layerData.ground.data;
        //result.coordinateOrigin = [lng, lat];
        //result.modelMatrix = layerData.ground.modelMatrix;
        break;
      default:
        result.data = [];
    }
    addLayer({
      ...result,
      id: `${layerType}${Date.now()}`,
      '@@type': layerType,
    });
    setShowUploadFileDialog(false);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files) {
      return;
    }

    // reset any error message
    setErrorMsg('');

    const file = e?.target?.files[0];
    const reader = new FileReader();
    const splits = file.name.split('.');
    const fileExtension = splits[splits.length - 1];
    switch (fileExtension) {
      case 'pb':
        reader.onload = () => {
          const result = reader.result as ArrayBuffer;
          const pbData = new Uint8Array(result);
          addLayerFromPbData(pbData);
        };
        reader.readAsArrayBuffer(file);
        break;
      case 'json':
        reader.onload = () => {
          const result = reader.result as string;
          // todo: need to find a way to determine what process the data should go through now
        };
        reader.readAsText(file);
        break;
      default:
        console.warn('example files should be explicit');
    }
  };

  return (
    <Transition.Root show={state.showUploadFileDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setShowUploadFileDialog(false)}
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
                    onClick={() => setShowUploadFileDialog(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Upload file
                </Dialog.Title>

                <div className="flex mt-6 text-md text-blue-900">
                  <InformationCircleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                  The upload function currently only supports .pb (protobuf)
                  files generated by the DTCC Platfrom
                </div>
                {errorMsg && (
                  <div className="flex mt-6 text-md text-red-600">
                    <ExclamationTriangleIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                    {errorMsg}
                  </div>
                )}
                <div className="flex mt-6 text-md text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium focus-within:outline-none hover:text-blue-400"
                  >
                    <span className="border-2 rounded-full px-2 py-1">
                      Select a file
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleUploadFile}
                    />
                  </label>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

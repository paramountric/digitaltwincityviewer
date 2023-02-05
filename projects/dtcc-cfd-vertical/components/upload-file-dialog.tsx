import {Fragment, useEffect, useState} from 'react';
import {useS3Upload} from 'next-s3-upload';
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
import {loadExampleData} from '../lib/load-example';

export default function UploadFileDialog() {
  const [fileUrl, setFileUrl] = useState<string>();
  const [listFiles, setListFiles] = useState<any[]>([]);
  const {FileInput, openFileDialog, uploadToS3, files} = useS3Upload();

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

  useEffect(() => {
    (async () => {
      const fileListRes = await fetch('/api/s3-file-list');
      const fileListRaw = await fileListRes.json();
      const fileList = fileListRaw.Contents.map((file: any) => {
        const fileName = file.Key.split('/').pop();
        const fileSize = (file.Size / 1000).toFixed();
        const d = new Date(file.LastModified);
        const lastModified = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        const url = `https://dtcc-cfd-vertical.s3.eu-north-1.amazonaws.com/${file.Key}`;
        return {name: fileName, size: fileSize, lastModified, url};
      });

      setListFiles(fileList);
    })();
  }, [fileUrl]);

  const [errorMsg, setErrorMsg] = useState<string>('');

  // const supportedPbTypes = ['CityModel', 'Surface3D'];
  // const layerMapping = ['CityModelLayer', 'GroundSurfaceLayer'];

  // const addLayerFromPbData = pbData => {
  //   const {pbJson, pbType, layerType} = findPbJson(pbData);
  //   if (!pbJson) {
  //     setErrorMsg(
  //       'This type is not supported. Supported types: CityModel, Surface3D'
  //     );
  //     return;
  //   }
  //   const cityId = findCityFromPb(pbJson);
  //   setCity(cityId);
  //   const result: any = {};
  //   if (!pbJson) {
  //     console.log('handle this');
  //   }
  //   const layerData = parseCityModel(pbJson, pbJson.crs, pbType);

  //   switch (pbType) {
  //     case 'CityModel':
  //       result.data = layerData.buildings.data;
  //       //result.coordinateOrigin = [lng, lat];
  //       // this makes it works perfectly, but how should other layers realate?
  //       //result.modelMatrix = layerData.buildings.modelMatrix;
  //       result.pickable = true;
  //       result.autoHighlight = true;
  //       break;
  //     case 'Surface3D':
  //       result.data = layerData.ground.data;
  //       //result.coordinateOrigin = [lng, lat];
  //       //result.modelMatrix = layerData.ground.modelMatrix;
  //       break;
  //     default:
  //       result.data = [];
  //   }
  //   addLayer({
  //     ...result,
  //     id: `${layerType}${Date.now()}`,
  //     '@@type': layerType,
  //   });
  //   setShowUploadFileDialog(false);
  // };

  const handleFileChange = async (file: any) => {
    const res = await uploadToS3(file);
    setFileUrl(res.url);
  };

  const handleViewFile = async (file: any) => {
    const fileExtension = file.name.split('.').pop();
    const result = await loadExampleData({
      url: file.url,
      fileExtension,
      text: file.name,
    });
    addLayer({
      ...result,
      id: `${file.name}${Date.now()}`,
      '@@type': result.layerType,
    });
    setShowUploadFileDialog(false);
  };

  // this is connected to the variant on the server side for uploading to s3
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handle upload file');
    if (!e?.target?.files) {
      return;
    }
    const formData = new FormData();

    formData.append('file', e.target.files[0]);

    const options = {
      method: 'POST',
      body: formData,
    };
    console.log('upload file');
    fetch('/api/upload', options);
  };

  // this could probably be removed, but could be used for preview
  const handlePreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          console.log('pb data was read, but not used');
          //addLayerFromPbData(pbData);
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
                  Datasets
                </Dialog.Title>

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
                  <div className="w-full">
                    <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
                      <h3>Upload file</h3>
                    </div>
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white focus-within:outline-none hover:text-blue-400"
                    >
                      <span className="border rounded-full px-2 p-1">
                        DTCC upload
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleUploadFile}
                      />
                    </label>
                    <FileInput onChange={handleFileChange} />
                    <button
                      className="border rounded-full p-1 px-2 m-2 mt-4 hover:ring-2"
                      onClick={openFileDialog}
                    >
                      S3 upload
                    </button>

                    <label
                      htmlFor="file-preview"
                      className="relative cursor-pointer rounded-md bg-white focus-within:outline-none hover:text-blue-400"
                    >
                      <span className="border rounded-full px-2 p-1">
                        Preview
                      </span>
                      <input
                        id="file-preview"
                        name="file-preview"
                        type="file"
                        className="sr-only"
                        onChange={handlePreview}
                      />
                    </label>

                    {files.map((file, index) => (
                      <div key={index}>Progress: {file.progress}%</div>
                    ))}

                    <div className="mt-4 overflow-hidden">
                      <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
                        <h3>Uploaded files</h3>
                      </div>
                      <ul role="list" className="divide-y divide-gray-200">
                        {listFiles &&
                          listFiles.map((file, index) => (
                            <li key={index}>
                              <div className="flex flex-row items-center justify-between px-4 py-4">
                                <div>{file.name}</div>
                                <div className="rounded-full border p-1 px-2 ml-2 text-sm items-baseline text-gray-500">
                                  {file.size} KB
                                </div>
                                <div className="rounded-full border p-1 px-2 ml-2 text-sm items-baseline text-gray-500">
                                  {file.lastModified}
                                </div>
                                <div
                                  onClick={() => handleViewFile(file)}
                                  className="rounded-full border border-slate-500 p-1 px-2 ml-2 text-sm items-baseline hover:bg-slate-500 hover:cursor-pointer hover:text-white text-gray-500"
                                >
                                  View
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

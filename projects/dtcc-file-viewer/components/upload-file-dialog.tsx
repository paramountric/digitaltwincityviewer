import {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon, ExclamationTriangleIcon} from '@heroicons/react/24/outline';
import {parseProtobuf} from '@dtcv/citymodel';
import {useUi} from '../hooks/use-ui';
import {useViewer} from '../hooks/use-viewer';

export default function UploadFileDialog() {
  const {
    state,
    actions: {setShowUploadFileDialog},
  } = useUi();

  const {
    actions: {addLayer},
  } = useViewer();

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files) {
      return;
    }
    const file = e?.target?.files[0];
    const reader = new FileReader();
    const splits = file.name.split('.');
    const fileExtension = splits[splits.length - 1];
    switch (fileExtension) {
      case 'pb':
        reader.onload = () => {
          const result = reader.result as ArrayBuffer;
          const pbData = new Uint8Array(result);
          // todo: need to find out how to see what pbType this is
          //const jsonData = parseProtobuf(pbData, pbType, city)
        };
        reader.readAsArrayBuffer(file);
        break;
      case 'json':
        reader.onload = () => {
          const result = reader.result as string;
          // todo: need to find a way to determine what process the data should go through now
        };
        reader.readAsText(file);
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

                <div className="flex mt-6 text-md text-red-600">
                  <ExclamationTriangleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                  The file upload function for DTCC citymodel files (.pb) is
                  currently in maintenance (disabled)
                </div>
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

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';
import { useTypes } from '../hooks/types';

export default function TypeDialog() {
  const {
    state,
    actions: { setShowTypeDialog },
  } = useUi();
  const {
    state: { loadedTypeMap },
  } = useTypes();

  console.log('loaded types', loadedTypeMap);

  const types = Object.values(loadedTypeMap);
  return (
    <Transition.Root show={state.showTypeDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setShowTypeDialog(false)}
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowTypeDialog(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                      <h1 className="text-xl font-semibold text-gray-900">
                        Types
                      </h1>
                      <p className="mt-2 text-sm text-gray-700">
                        A list of all types added to the
                        &quot;types&quot;-branches of Speckle streams
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none sm:w-auto"
                      >
                        Add type
                      </button>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                >
                                  Name
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Description
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Version
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Schema
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Created at
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Updated at
                                </th>
                                <th
                                  scope="col"
                                  className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                >
                                  <span className="sr-only">Edit</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {types.map(type => (
                                <tr key={type.name}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {type.name}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {type.description}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {type.version}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <pre>
                                      <code>
                                        {JSON.stringify(type.schema, null, 2)}
                                      </code>
                                    </pre>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {type.createdAt}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {type.updatedAt}
                                  </td>
                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a
                                      href="#"
                                      className="text-blue-400 hover:text-blue-500"
                                    >
                                      Edit
                                      <span className="sr-only">
                                        , {type.name}
                                      </span>
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
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

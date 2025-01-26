import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  XMarkIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/20/solid';
import { validate } from 'jtd';
import { useUi } from '../hooks/ui';
import { useUser } from '../hooks/user';
import { useStreams } from '../hooks/streams';
import { useToken } from '../hooks/token';
import { useObjects } from '../hooks/objects';
import { Type, TypeMap, useTypes } from '../hooks/types';
import { Node } from '@paramountric/entity';

const navigation = [
  { name: 'Progress', href: '#', current: true },
  // { name: 'Sustainability', href: '#', current: false },
  // { name: 'Catalog', href: '#', current: false },
  // { name: 'Reports', href: '#', current: false },
];
const userNavigation = [
  // { name: 'Your Profile', href: '#' },
  // { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user } = useUser();
  const {
    actions: { setShowAddBaseDialog, setShowValidation, setShowTypeDialog },
    state: { showValidation, showTypeDialog },
  } = useUi();
  const { typeCommits } = useStreams();
  const tokenData = useToken();
  const {
    actions: { loadBucket, getBucketLoader },
    state: bucketLoaderState,
  } = useObjects();
  const {
    actions: { setTypes },
    state: { loadedTypeMap },
  } = useTypes();

  const loadTypes = async () => {
    if (!tokenData?.token) {
      return;
    }
    console.log(typeCommits);
    const loaders = [];
    for (const commit of typeCommits) {
      const bucketLoader = await loadBucket(
        commit.streamId,
        commit.id,
        commit.referencedObject,
        tokenData.token
      );
      loaders.push(bucketLoader);
    }
    const typeMap: TypeMap = {};
    for (const loader of loaders) {
      console.log('bucket loader', loader);
      Object.assign(typeMap, loader.typeMap);
    }
    console.log('typemap', typeMap);
    setTypes(Object.values(typeMap));
  };

  const handleShowAddBaseDialog = () => {
    setShowAddBaseDialog(true);
  };
  const handleToggleTypes = async () => {
    // reload types if toggle to true
    // if (!showTypeDialog) {
    //   await loadTypes();
    // }
    setShowTypeDialog(!showTypeDialog);
  };
  const handleToggleValidation = async () => {
    if (!showValidation) {
      await loadTypes();
    }
    setShowValidation(!showValidation);
  };
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="absolute z-10 bg-white w-full mx-auto px-4 sm:px-6 lg:px-8 shadow-sm">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Square3Stack3DIcon
                    className="h-10 w-10 stroke-gray-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {navigation.map(item => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'px-3 py-2 rounded-md text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                  <a
                    onClick={handleToggleTypes}
                    className={classNames(
                      showTypeDialog
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'px-3 py-2 rounded-md text-sm font-medium'
                    )}
                    aria-current={showTypeDialog ? 'page' : undefined}
                  >
                    Types
                  </a>
                  {/* <a
                    onClick={handleToggleValidation}
                    className={classNames(
                      showValidation
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'px-3 py-2 rounded-md text-sm font-medium'
                    )}
                    aria-current={showValidation ? 'page' : undefined}
                  >
                    Validation
                  </a> */}
                </div>
              </div>
              {user ? (
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {/* <button
                      onClick={handleShowAddBaseDialog}
                      type="button"
                      className="relative inline-flex items-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <PlusIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      <span>Add Base</span>
                    </button> */}
                  </div>
                  <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                    {/* <button
                      type="button"
                      className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button> */}

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full ring-2 ring-gray-300"
                            src={user?.avatar}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map(item => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  {/* <div className="flex-shrink-0">
                    <button
                      onClick={handleShowAddBaseDialog}
                      type="button"
                      className="relative inline-flex items-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <PlusIcon
                        className="-ml-1 mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      <span>Add Base</span>
                    </button>
                  </div> */}
                </div>
              )}
            </div>
          </div>
          {/*user && (
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                {navigation.map(item => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block px-3 py-2 rounded-md text-base font-medium'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 pb-3">
                <div className="flex items-center px-5 sm:px-6">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2 sm:px-3">
                  {userNavigation.map(item => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </div>
            </Disclosure.Panel>
                  )*/}
        </>
      )}
    </Disclosure>
  );
}

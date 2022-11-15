import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../assets/dtcc-logo.png';
import {useUi} from '../hooks/use-ui';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  const {actions: uiActions} = useUi();

  const handleShowUploadFileDialog = () => {
    uiActions.setShowUploadFileDialog(true);
  };

  const handleShowLoadExampleDialog = () => {
    uiActions.setShowLoadCityDialog(true);
  };

  return (
    <div className="absolute w-full z-50 overflow-hidden">
      <Head>
        <title>City Model File Viewer</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="shadow-sm p-1 border-b top-0 sticky z-50 bg-white">
        <div className="flex items-center justify-between mx-4">
          <div className="flex items-center">
            <Image className="h-10 w-32" alt="DTCV logo" src={logo}></Image>
            <div className="text-lg ml-2 text-gray-700">
              City Model File Viewer
            </div>
            <button
              onClick={handleShowUploadFileDialog}
              className="border rounded-full p-1 px-2 m-2 hover:ring-2 ml-10"
            >
              Upload file
            </button>
            <button
              onClick={handleShowLoadExampleDialog}
              className="border rounded-full p-1 px-2 m-2 hover:ring-2"
            >
              Load example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

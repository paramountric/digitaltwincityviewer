import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../assets/logo.png';
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
    <div className="absolute w-full z-20 overflow-hidden">
      <Head>
        <title>3CIM Testdata</title>
        <meta name="description" content="3CIM Testdata" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="shadow-sm border-b top-0 sticky z-50 bg-white">
        <div className="flex items-center justify-between mx-4">
          <div className="flex items-center">
            <div className="h-10 w-10 m-2">
              <Image src={logo} alt="logo of DTCV" />
            </div>
            <div className="text-xl ml-2 text-gray-500">3CIM Testdata</div>
            <button
              onClick={handleShowLoadExampleDialog}
              className="border rounded-full p-1 px-2 m-2 hover:ring-2"
            >
              Ladda exempel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../public/logo.png';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="absolute w-full z-50 overflow-hidden">
      <Head>
        <title>DTCV Publisher</title>
        <meta name="description" content="Digital Twin City Viewer Publisher" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="shadow-sm border-b top-0 sticky z-50 bg-white">
        <div className="flex items-center justify-between mx-4">
          <div className="flex items-center">
            <div className="h-8 w-8 m-1">
              <Image src={logo} alt="logo of DTCC" />
            </div>
            <div className="text-lg ml-2 text-gray-700">DTCV Publisher</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

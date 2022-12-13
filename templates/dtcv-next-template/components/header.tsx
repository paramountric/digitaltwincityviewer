import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../assets/logo.png';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="absolute w-full z-50 overflow-hidden">
      <Head>
        <title>Next Deck Starter</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="shadow-sm border-b top-0 sticky z-50 bg-white">
        <div className="flex items-center justify-between mx-4">
          <div className="flex items-center">
            <Image className="h-10 w-10" alt="DTCV logo" src={logo}></Image>
            <div className="text-lg ml-2 text-gray-700">DTCV</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

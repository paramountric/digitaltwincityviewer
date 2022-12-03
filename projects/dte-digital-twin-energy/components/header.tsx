import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../public/dtcc-logo.png';
import {useUserInfo} from '../hooks/use-user';
import {useSignOut} from '../hooks/use-signout';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  return (
    <div className="absolute w-full z-50 overflow-hidden">
      <Head>
        <title>DTE Digital Twin Energy</title>
        <meta
          name="description"
          content="DTE Digital Twin Energy project by Chalmers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="shadow-sm border-b top-0 sticky z-50 bg-white">
        <div className="flex items-center justify-between mx-4">
          <div className="flex items-center">
            <div className="h-12 w-32 mt-3">
              <Image src={logo} alt="logo of DTCC" />
            </div>
            <div className="text-xl ml-2 text-gray-500">
              Digitial Twin Energy
            </div>
          </div>
          {userInfo ? (
            <div className="flex space-x-4 items-center">
              <div className="text-gray-600 cursor-pointer">
                {userInfo.userName}
              </div>
              <button
                onClick={signOut}
                className="border border-gray-500 text-gray-700 bg-white rounded-md px-2 cursor-pointer hover:bg-gray-100"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;

import Head from 'next/head';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import logo from '../public/dtcc-logo.png';
import { useUserInfo } from '../hooks/use-user';
import { useSignOut } from '../hooks/use-signout';

type HeaderProps = {
  children: ReactNode;
};

const Header: React.FC<HeaderProps> = ({ children }) => {
  console.log(children);
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  return (
    <div className="absolute z-50 w-full">
      <Head>
        <title>DTE Digital Twin Energy</title>
        <meta
          name="description"
          content="DTE Digital Twin Energy project by Chalmers"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center px-4 py-3">
          <div className="flex items-center mr-8">
            <div className="w-32 h-12 mt-3">
              <Image src={logo} alt="logo of DTCC" />
            </div>
            {/* <div className="ml-2 text-xl text-gray-500">
              Digital Twin Energy
            </div> */}
          </div>
          {children}
          {userInfo ? (
            <div className="flex items-center ml-auto space-x-4">
              {/* <div className="text-gray-600 cursor-pointer">
                {userInfo.userName}
              </div> */}
              <button
                onClick={signOut}
                className="px-2 text-gray-700 bg-white border border-gray-500 rounded-md cursor-pointer hover:bg-gray-100"
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

import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import logo from '../public/dtcc-logo.png';
import {useUser} from '../hooks/user';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  const {user} = useUser();
  console.log(user);
  const signOut = () => {
    console.log('TODO');
  };
  return (
    <div className="absolute w-full z-50 overflow-hidden">
      <Head>
        <title>DoD Validator</title>
        <meta
          name="description"
          content="DoD Validator is an app to manage object types for data interoperability in the built environment"
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
              Design Data Type Validator
            </div>
          </div>
          {user ? (
            <div className="flex space-x-4 items-center">
              <div className="text-gray-600 cursor-pointer">{user.name}</div>
              <button
                onClick={signOut}
                className="border border-gray-500 text-gray-700 bg-white rounded-md px-2 cursor-pointer hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;

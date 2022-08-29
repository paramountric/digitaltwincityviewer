import type {NextPage} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import logo from '../public/dtcc-logo.png';
import Viewport from '../components/viewport';
import Login from '../components/login';
import {useUserInfo} from '../hooks/userinfo';
import {useSignOut} from '../hooks/signout';

const StartPage: NextPage = () => {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  console.log(userInfo);
  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
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

        {userInfo ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

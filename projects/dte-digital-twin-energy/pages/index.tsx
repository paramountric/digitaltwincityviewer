import type {NextPage} from 'next';
import Head from 'next/head';
import Viewport from '../components/viewport';
import Login from '../components/login';
import {useUserInfo} from '../hooks/userinfo';

const StartPage: NextPage = () => {
  const userInfo = useUserInfo();
  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <div className="absolute z-50 overflow-hidden">
          <Head>
            <title>DTE Digital Twin Energy</title>
            <meta
              name="description"
              content="DTE Digital Twin Energy project by Chalmers"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>
        </div>

        {userInfo ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

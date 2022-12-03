import type {NextPage} from 'next';
import React from 'react';
import Header from '../components/header';
import Viewport from '../components/viewport';
import Login from '../components/login';
import {useUserInfo} from '../hooks/use-user';

const StartPage: NextPage = () => {
  const userInfo = useUserInfo();
  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <React.StrictMode>
          <Header></Header>
        </React.StrictMode>

        {userInfo ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

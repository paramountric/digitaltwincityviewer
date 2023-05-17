import { useUser } from '../hooks/use-user';
import React from 'react';
import type { NextPage } from 'next';
import Header from '../components/Header';
import Viewport from '../components/Viewport/Viewport';
import Login from '../components/Login/Login';
import ActionPanel from '../components/ActionPanel/ActionPanel';

const StartPage: NextPage = () => {
  const userInfo = useUser();
  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <React.StrictMode>
          <Header>
            <ActionPanel />
          </Header>
        </React.StrictMode>

        {userInfo ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

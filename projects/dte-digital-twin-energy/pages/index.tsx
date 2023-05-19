import { useUser } from '../hooks/use-user';
import React from 'react';
import type { NextPage } from 'next';
import Header from '../components/Header/Header';
import HeaderActionPanel from '../components/Header/HeaderActionPanel';
import Viewport from '../components/Viewport/Viewport';
import Login from '../components/Login/Login';

const StartPage: NextPage = () => {
  const { isSignedIn } = useUser();
  return (
    <div>
      <main>
        <Header>
          <HeaderActionPanel />
        </Header>
        {isSignedIn ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

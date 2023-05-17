import { useUser } from '../hooks/use-user';
import React from 'react';
import type { NextPage } from 'next';
import Header from '../components/Header';
import Viewport from '../components/Viewport/Viewport';
import Login from '../components/Login/Login';
import ActionPanel from '../components/ActionPanel/ActionPanel';

const StartPage: NextPage = () => {
  const { isSignedIn } = useUser();
  console.log('isSignedIn', isSignedIn);
  return (
    <div>
      <main>
        <Header>
          <ActionPanel />
        </Header>
        {isSignedIn ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

export default StartPage;

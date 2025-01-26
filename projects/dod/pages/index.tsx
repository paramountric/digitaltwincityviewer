import React from 'react';
import logo from '../public/rocket1.png';
import type { NextPage } from 'next';
import Redis from 'ioredis';

import Viewport from '../components/viewport';
import Login from '../components/login';
import { useUser } from '../hooks/user';
import { useSignOut } from '../hooks/signout';
import Navbar from '../components/navbar';

//let redis = new Redis(process.env.REDIS_URL || '');

type StartPageProps = {
  projectCache: any;
};

const StartPage: NextPage<StartPageProps> = ({ projectCache }) => {
  // ! note this is server side props redis test:
  //console.log(projectCache);
  const { user } = useUser();
  const signOut = useSignOut();
  console.log(user);
  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <Navbar></Navbar>
        {user ? <Viewport /> : <Login />}
      </main>
    </div>
  );
};

//export async function getServerSideProps() {
// const projectCache = await redis.incr('counter');
// console.log(projectCache);
// return { props: { projectCache } };
//}

export default StartPage;

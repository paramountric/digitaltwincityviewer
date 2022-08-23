import Head from 'next/head';
import Link from 'next/link';
import {useSignOut} from '../hooks/use-signout';
import {useUserInfo} from '../hooks/use-userinfo';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({title}) => {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  return (
    <>
      <Head>
        <title>DoD - Design och Data</title>
        <meta
          name="description"
          content="DoD is a project about built environment design process interoperability in digital twins"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        {userInfo ? (
          <>
            <li>{userInfo.name}</li>
            <li>
              <button onClick={() => signOut}>Sign Out</button>
            </li>
          </>
        ) : (
          <li>
            <Link href="/api/auth/signin">
              <a>Sign In</a>
            </Link>
          </li>
        )}
      </nav>
    </>
  );
};

export default Header;

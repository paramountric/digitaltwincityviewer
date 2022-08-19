import {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {useSignOut} from '../hooks/use-signout';
import {useUserInfo} from '../hooks/use-userinfo';

interface HeaderPageProps {
  title: string;
}

const Header: NextPage<HeaderPageProps> = ({title}) => {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  console.log(userInfo);
  return (
    <>
      <Head>
        <title>DoD - {title}</title>
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
            <Link href="/signin">
              <a>Sign In</a>
            </Link>
          </li>
        )}
      </nav>
    </>
  );
};

export default Header;

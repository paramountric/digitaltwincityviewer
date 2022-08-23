import type {NextPage} from 'next';
import Link from 'next/link';
import Header from '../components/header';
import Viewport from '../components/viewport';
import {useUserInfo} from '../hooks/use-userinfo';

const ViewerPage: NextPage = () => {
  const userInfo = useUserInfo();

  console.log(userInfo);

  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <div className="absolute z-50 overflow-hidden">
          <Header title="Design och Data" />
        </div>

        {userInfo ? (
          <Viewport />
        ) : (
          <button>
            <Link href="/api/auth/signin">
              <a>Sign In</a>
            </Link>
          </button>
        )}
      </main>
    </div>
  );
};

export default ViewerPage;

import Link from 'next/link';

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col m-10">
        <button className="w-full p-3 mt-4 bg-green-400 text-white rounded-sm shadow-md border hover:shadow-lg hover:bg-opacity-90">
          <Link href="/api/auth/signin">
            <a>Sign In</a>
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Login;

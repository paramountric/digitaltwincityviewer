import { useState } from 'react';
import Link from 'next/link';
import { useSignIn } from '../hooks/signin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInError, signInLoading } = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col m-10">
        <>
          <button
            className="w-full p-3 mt-4 bg-green-600 text-white rounded-md shadow-md border hover:shadow-lg hover:bg-opacity-90"
            type="submit"
          >
            <Link href="/api/auth/signin">
              <a>Sign In</a>
            </Link>
          </button>
        </>
      </div>
    </div>
  );
};

export default Login;

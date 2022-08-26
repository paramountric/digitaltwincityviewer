import {useState} from 'react';
import {useSignIn} from '../hooks/signin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, signInError, signInLoading} = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn({email, password});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col m-10">
        <h1 className="text-3xl text-blue-400 mb-5">Log in</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label>
            <span className="text-gray-600">Email</span>
            <input
              className="w-full p-2 border border-gray-400 rounded-sm"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span className="text-gray-600">Password</span>
            <input
              className="w-full p-2 border border-gray-400 rounded-sm"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          {signInError && <p className="text-red-600">Invalid credentials</p>}
          {signInLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <button
                className="w-full p-3 mt-4 bg-blue-400 text-white rounded-md shadow-md border hover:shadow-lg hover:bg-opacity-90"
                type="submit"
              >
                Sign In
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;

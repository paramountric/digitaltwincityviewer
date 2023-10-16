import { useState } from 'react';
import { useUser } from '../../hooks/use-user';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Demo User');
  const { actions: userActions, signInError, signInLoading } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    userActions.signIn(name, email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col m-10">
        <h1 className="mb-5 text-3xl text-blue-400">Log in</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label>
            <span className="text-gray-600">Username</span>
            <input
              className="w-full p-2 border border-gray-400 rounded-md"
              type="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <label>
            <span className="text-gray-600">Email</span>
            <input
              className="w-full p-2 border border-gray-400 rounded-md"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span className="text-gray-600">Password</span>
            <input
              className="w-full p-2 border border-gray-400 rounded-md"
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
                className="w-full p-3 mt-4 text-white bg-blue-400 border rounded-md shadow-md hover:shadow-lg hover:bg-opacity-90"
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

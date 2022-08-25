import {useState} from 'react';
import {useSignIn} from '../hooks/signin';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, signInError, signInLoading} = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = await signIn({email, password});
    // if (valid) {
    //   router.push('/');
    // }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span>Password</span>
        <input
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
          <button type="submit">Sign In</button>
        </>
      )}
    </form>
  );
};

export default Login;

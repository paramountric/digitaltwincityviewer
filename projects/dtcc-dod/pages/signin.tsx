import {useRouter} from 'next/router';
import {EventHandler, useState} from 'react';
import Header from '../components/header';
import InputLabel from '../components/input-label';
import {useSignIn} from '../hooks/use-signin';

function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, signInError, signInLoading} = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = await signIn(email, password);
    if (valid) {
      router.push('/');
    }
  };

  return (
    <>
      <Header title="sign in" />
      <form onSubmit={handleSubmit}>
        <InputLabel label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </InputLabel>
        <InputLabel label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </InputLabel>
        {signInError && <p className="text-red-600">Invalid credentials</p>}
        {signInLoading ? (
          <p>Loading...</p>
        ) : (
          <button type="submit">Sign In</button>
        )}
      </form>
    </>
  );
}

export default SignInPage;

import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';

const {SPECKLE_SERVER_URL, APP_SECRET} = process.env;

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const {email, password} = req.body;
  const challenge = 'fixme';
  try {
    const signInRes = await fetch(
      `${SPECKLE_SERVER_URL}/auth/local/login?challenge=${challenge}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({identifier: email, password}),
      }
    );
    if (!signInRes.ok) {
      throw new Error('Sign in failed with ' + signInRes.status);
    }
    const signInData = await signInRes.json();

    const tokenRes = await fetch('http://localhost:3000/auth/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        appId: 'dod',
        appSecret: APP_SECRET,
        accessCode: signInData.accessCode,
        challenge,
      }),
    });

    if (!signInRes.ok) {
      throw new Error('Token request failed with ' + signInRes.status);
    }

    const tokenData = await tokenRes.json();

    console.log(tokenData);

    res
      .status(200)
      .setHeader(
        'Set-Cookie',
        cookie.serialize('sess', tokenData, {
          path: '/api',
          httpOnly: true,
        })
      )
      .json({
        id: '12312',
        name: 'user.username',
      });
  } catch (err) {
    res.status(401).end();
  }
}

export default handleLogin;

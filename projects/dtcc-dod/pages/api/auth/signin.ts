import type {NextApiRequest, NextApiResponse} from 'next';
//import cookie from 'cookie';

const {SPECKLE_SERVER_URL, APP_ID} = process.env;
const challenge = 'fixmelater';

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const redirectUri = `${SPECKLE_SERVER_URL}/authn/verify/${APP_ID}/${challenge}`;
    res.redirect(redirectUri);
    return;
  }
  // use oauth2 auth through speckle for now, later see if a cookie session should be created
  //const {email, password} = req.body;
  res.status(401).end();
  // try {
  //   const signInRes = await fetch(
  //     `${SPECKLE_SERVER_URL}/auth/local/login?challenge=${challenge}`,
  //     {
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       body: JSON.stringify({email, password}),
  //     }
  //   );

  //   if (!signInRes.ok) {
  //     console.log(signInRes.status);
  //     throw new Error('Sign in failed with ' + signInRes.status);
  //   }

  //   const tokenRes = await fetch(`${SPECKLE_SERVER_URL}/auth/token`, {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: JSON.stringify({
  //       appId: APP_ID,
  //       appSecret: APP_SECRET,
  //       accessCode,
  //       challenge,
  //     }),
  //   });

  //   if (!tokenRes.ok) {
  //     console.log('token error', signInRes.status);
  //     throw new Error('Token request failed with ' + signInRes.status);
  //   }

  //   console.log('token');

  //   const tokenData = await tokenRes.json();

  //   console.log(tokenData);

  //   res
  //     .status(200)
  //     .setHeader(
  //       'Set-Cookie',
  //       cookie.serialize('sess', tokenData, {
  //         path: '/api',
  //         httpOnly: true,
  //       })
  //     )
  //     .json({
  //       id: '12312',
  //       name: 'user.username',
  //     });
  // } catch (err) {
  //   console.log(err);
  //   res.status(401).end();
  // }
}

export default handleLogin;

import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';

const {SPECKLE_SERVER_URL, APP_ID, APP_SECRET} = process.env;
const challenge = '123qweasd';

async function handleToken(req: NextApiRequest, res: NextApiResponse) {
  const accessCode = req.query.accessCode;

  const tokenRes = await fetch(`${SPECKLE_SERVER_URL}/auth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      appId: APP_ID,
      appSecret: APP_SECRET,
      accessCode,
      challenge,
    }),
  });

  if (!tokenRes.ok) {
    console.log('token error', tokenRes.status);
    throw new Error('Token request failed with ' + tokenRes.status);
  }

  console.log('token');

  const tokenData = await tokenRes.json();

  console.log(tokenData);
  res.redirect('/');
}

export default handleToken;

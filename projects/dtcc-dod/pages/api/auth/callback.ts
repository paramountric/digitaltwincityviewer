import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const {
  SPECKLE_SERVER_URL,
  SPECKLE_APP_ID,
  SPECKLE_APP_SECRET,
  JWT_SECRET = '',
  CHALLENGE,
} = process.env;

// todo: challenge should be generated instead
const challenge = CHALLENGE;

async function handleToken(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const accessCode = req.query.access_code;
  try {
    const tokenRes = await fetch(`${SPECKLE_SERVER_URL}/auth/token`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        appId: SPECKLE_APP_ID,
        appSecret: SPECKLE_APP_SECRET,
        accessCode,
        challenge,
      }),
    });

    if (!tokenRes.ok) {
      console.log('token error', tokenRes.status);
      throw new Error('Token request failed with ' + tokenRes.status);
    }

    const tokenData = await tokenRes.json();

    console.log('token', tokenData);

    // todo: encrypt
    const token = jwt.sign(tokenData, JWT_SECRET, {expiresIn: '24h'});

    res
      .status(200)
      .setHeader(
        'Set-Cookie',
        cookie.serialize('dod', token, {
          path: '/api',
          httpOnly: true,
        })
      )
      .redirect('/');
  } catch (e) {
    console.log(e);
    res.redirect('/');
  }
}

export default handleToken;

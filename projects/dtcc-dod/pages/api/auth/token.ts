import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const {
  SPECKLE_SERVER_URL,
  SPECKLE_APP_ID,
  SPECKLE_APP_SECRET,
  JWT_SECRET = '',
} = process.env;
const challenge = '123qweasd'; // todo: fix this on the session

async function handleToken(req: NextApiRequest, res: NextApiResponse) {
  const accessCode = req.query.access_code;

  console.log('got access code', accessCode);
  console.log(SPECKLE_APP_ID, SPECKLE_SERVER_URL);

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

    console.log(tokenData);

    // todo: obviously not a good idea, put the refresh on session instead
    const token = jwt.sign(tokenData, JWT_SECRET, {expiresIn: '24h'});

    res
      .status(200)
      .setHeader(
        'Set-Cookie',
        cookie.serialize('spkl', token, {
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

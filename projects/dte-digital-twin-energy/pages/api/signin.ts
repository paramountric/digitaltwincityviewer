import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const {DEMO_EMAIL, DEMO_PASSWORD, JWT_SECRET = ''} = process.env;

if (!DEMO_EMAIL || !DEMO_PASSWORD || !JWT_SECRET) {
  console.error('Remember to add auth env vars!');
  process.exit(1);
}

// note that this is not the credentials:
const USER_NAME = 'Demo';
const USER_ID = 'demo';

async function handleSignIn(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const {email, password} = req.body;

  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    res.status(401).end();
    return;
  }

  const user = {
    userId: USER_ID,
    userName: USER_NAME,
  };

  const token = jwt.sign(user, JWT_SECRET, {expiresIn: '36h'});

  res
    .status(200)
    .setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        path: '/api',
        httpOnly: true,
      })
    )
    .json(user);
}

export default handleSignIn;

import type {NextApiRequest, NextApiResponse} from 'next';

const {SPECKLE_SERVER_URL, SPECKLE_APP_ID, CHALLENGE} = process.env;

// todo: challenge should be generated instead
const challenge = CHALLENGE;

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const redirectUri = `${SPECKLE_SERVER_URL}/authn/verify/${SPECKLE_APP_ID}/${challenge}`;
    res.redirect(redirectUri);
    return;
  }
  res.status(405).end();
}

export default handleLogin;

import type {NextApiRequest, NextApiResponse} from 'next';
//import cookie from 'cookie';

const {SPECKLE_SERVER_URL, SPECKLE_APP_ID} = process.env;
const challenge = '123qweasd'; // todo: fix this on the session

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const redirectUri = `${SPECKLE_SERVER_URL}/authn/verify/${SPECKLE_APP_ID}/${challenge}`;
    res.redirect(redirectUri);
    return;
  }
  res.status(405).end();
}

export default handleLogin;

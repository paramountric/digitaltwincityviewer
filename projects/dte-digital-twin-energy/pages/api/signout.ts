import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';

function handleSignOut(req: NextApiRequest, res: NextApiResponse) {
  res
    .status(200)
    .setHeader(
      'Set-Cookie',
      cookie.serialize('token', '', {
        path: '/api',
        expires: new Date(0),
      })
    )
    .json({});
}

export default handleSignOut;

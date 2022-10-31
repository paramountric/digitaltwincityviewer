import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';

type SignOutResult = {};

export default function handleSignOut(
  req: NextApiRequest,
  res: NextApiResponse<SignOutResult>
) {
  console.log('sign out');
  res
    .status(200)
    .setHeader(
      'Set-Cookie',
      cookie.serialize('dod', '', {
        path: '/api',
        expires: new Date(0),
      })
    )
    .end();
}

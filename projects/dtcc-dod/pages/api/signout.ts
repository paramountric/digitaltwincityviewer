import type {NextApiRequest, NextApiResponse} from 'next';
import cookie from 'cookie';

type SignOutResult = {};

export default function handleSignOut(
  req: NextApiRequest,
  res: NextApiResponse<SignOutResult>
) {
  res
    .status(200)
    .setHeader(
      'Set-Cookie',
      cookie.serialize('jwt', '', {
        path: '/api',
        expires: new Date(0),
      })
    )
    .json({});
}

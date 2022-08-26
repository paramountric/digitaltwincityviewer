import type {NextApiRequest, NextApiResponse} from 'next';
import jwt from 'jsonwebtoken';

const {JWT_SECRET = ''} = process.env;

if (!JWT_SECRET) {
  console.error('Remember to add user env vars!');
  process.exit(1);
}

export default async function handleGetUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const {token} = req.cookies;
  if (!token) {
    res.status(401).end();
    return;
  }
  try {
    const jwtPayload = jwt.verify(token, JWT_SECRET) as any;
    const {userName, userId} = jwtPayload;
    if (!userName || !userId) {
      throw new Error('Configuration error. The user info cannot be falsy');
    }
    res.status(200).json({
      userName,
      userId,
    });
  } catch (err) {
    res.status(401).end();
  }
}

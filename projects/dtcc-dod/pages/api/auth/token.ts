import type {NextApiRequest, NextApiResponse} from 'next';
import jwt from 'jsonwebtoken';

const {JWT_SECRET = ''} = process.env;

async function handleToken(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const {dod} = req.cookies;
  if (!dod) {
    console.log('wrong key');
    res.status(401).end();
    return;
  }
  try {
    const {token} = jwt.verify(dod, JWT_SECRET) as any;
    if (!token) {
      throw new Error('no token');
    }
    res.status(200).json({
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(401).end();
  }
}

export default handleToken;

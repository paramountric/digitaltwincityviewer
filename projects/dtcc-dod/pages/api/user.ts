import type {NextApiRequest, NextApiResponse} from 'next';
import jwt from 'jsonwebtoken';

const {SPECKLE_SERVER_URL, JWT_SECRET = ''} = process.env;

async function handleUser(req: NextApiRequest, res: NextApiResponse) {
  const {spkl} = req.cookies;
  if (!spkl) {
    console.log('wrong key');
    res.status(401).end();
    return;
  }
  try {
    const {token} = jwt.verify(spkl, JWT_SECRET) as any;
    if (!token) {
      throw new Error('no token');
    }
    // todo: connect graphql
    // const userReq = await fetch(`${SPECKLE_SERVER_URL}/users/me`, {
    //   headers: {Authorization: `Bearer ${token}`},
    // });
    // if (!userReq.ok) {
    //   // try refreshToken
    //   throw new Error('User request failed with ' + userReq.status);
    // }
    // console.log(userReq);
    // const userData = await userReq.json();
    res.status(200).json({
      id: 'id',
      name: 'name',
    });
  } catch (err) {
    console.log(err);
    res.status(401).end();
  }
}

export default handleUser;

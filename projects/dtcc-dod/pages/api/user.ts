import type {NextApiRequest, NextApiResponse} from 'next';

const {SPECKLE_SERVER_URL} = process.env;

async function handleUser(req: NextApiRequest, res: NextApiResponse) {
  const {jwt} = req.cookies;
  if (!jwt) {
    res.status(401).end();
    return;
  }
  try {
    const userReq = await fetch(`${SPECKLE_SERVER_URL}/users/me`, {
      headers: {Authorization: `Bearer ${jwt}`},
    });
    if (!userReq.ok) {
      throw new Error('User request failed with ' + userReq.status);
    }
    const userData = await userReq.json();
    res.status(200).json({
      id: userData.id,
      name: userData.username,
    });
  } catch (err) {
    res.status(401).end();
  }
}

export default handleUser;

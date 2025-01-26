import type { NextApiRequest, NextApiResponse } from 'next';
import ObjectLoader from '@speckle/objectloader';
import jwt from 'jsonwebtoken';

// purpose of this end point is to load all commits/branches/objects in a stream into the cache db

const { SPECKLE_SERVER_URL, JWT_SECRET = '' } = process.env;

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const { bb } = req.cookies;
  if (!bb) {
    console.log('wrong key');
    res.status(401).end();
    return;
  }
  try {
    const { token } = jwt.verify(bb, JWT_SECRET) as any;
    if (!token) {
      throw new Error('no token');
    }

    // todo: call the api for all commits from the stream

    const loader = new ObjectLoader({
      serverUrl: SPECKLE_SERVER_URL,
      token,
      streamId: '00558aa224',
      objectId: 'have to get the object id',
      options: { enableCaching: false },
    });

    // this is concept of the speckle viewer to have a converter to gradually parse/convert from speckle format to application format
    // this.converter = new Converter(this.loader)

    res.status(200).json({
      message:
        'now the objects should have been loaded into the projects cache, and the client should trigger a load of the current aggregation',
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
    return;
  }
}

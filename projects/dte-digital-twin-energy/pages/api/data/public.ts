import type {NextApiRequest, NextApiResponse} from 'next';
import testData from './osm-gbg-center.json';

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    res.status(200).json(testData);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

import {FeatureCollection} from '@dtcv/geojson';
import type {NextApiRequest, NextApiResponse} from 'next';

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  // this is to offload loaded data in a simple way, yet keeping the format to geojson
  res.status(200).json({
    type: 'FeatureCollection',
    features: [],
  } as FeatureCollection);
}

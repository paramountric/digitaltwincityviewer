import type {NextApiRequest, NextApiResponse} from 'next';
import {convert, FeatureCollection} from '@dtcv/geojson';
import {cities} from '@dtcv/cities';
import testData from './osm-gbg-center.json';

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

const converted = convert(testData as FeatureCollection, 'EPSG:4326', [
  gothenburg.x,
  gothenburg.y,
]);

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  res.status(200).json(converted);
}

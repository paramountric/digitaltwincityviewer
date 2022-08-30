import type {NextApiRequest, NextApiResponse} from 'next';
import {
  getLayerPosition,
  coordinatesToMeters,
  Feature,
  FeatureCollection,
} from '@dtcv/geojson';
import testData from './osm-gbg-center.json';

type ViewerData = {
  buildings: Feature[];
  modelMatrix: number[];
  center: number[];
};

const {features} = testData as FeatureCollection;
coordinatesToMeters(features);
const {center, modelMatrix} = getLayerPosition(features);

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    res.status(200).json({
      buildings: features,
      modelMatrix: Array.from(modelMatrix),
      center,
    } as ViewerData);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

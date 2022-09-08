import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import jwt from 'jsonwebtoken';
import {parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

const {
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_ENDPOINT,
  S3_REGION,
  S3_BUCKET,
  S3_OBJECT_KEY,
  JWT_SECRET = '',
} = process.env;

if (
  !S3_ACCESS_KEY ||
  !S3_SECRET_KEY ||
  !S3_ENDPOINT ||
  !S3_REGION ||
  !S3_BUCKET
) {
  console.error('Remember to add s3 env vars!');
  process.exit(1);
}

const client = new S3Client({
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
});

const streamToBuffer = (stream: Readable) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.once('end', () => resolve(Buffer.concat(chunks)));
    stream.once('error', reject);
  });

// convenience function to fix data while iterating fast in the project, ideally the data is already coming in correctly
const preprocessBuildings = (buildings: any) => {
  const propertiyKeysPerM2 = [
    'deliveredEnergy2020',
    'deliveredEnergy2030',
    'deliveredEnergy2050',
    'primaryEnergy2020',
    'primaryEnergy2030',
    'primaryEnergy2050',
    'finalEnergy2020',
    'finalEnergy2030',
    'finalEnergy2050',
    'ghgEmissions2020',
    'ghgEmissions2030',
    'ghgEmissions2050',
    'heatDemand2020',
    'heatDemand2030',
    'heatDemand2050',
  ];
  for (const building of buildings) {
    for (const propertyKey of propertiyKeysPerM2)
      building.properties[`${propertyKey}M2`] =
        building.properties[propertyKey] / building.properties.heatedFloorArea;
  }
};

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const {token} = req.cookies;
  if (!token) {
    res.status(401).json({
      message: 'This data is protected from public access. Please login.',
    });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    res.status(401).json({
      message: 'This data is protected from public access. Please login.',
    });
  }

  const command = new GetObjectCommand({Bucket: S3_BUCKET, Key: S3_OBJECT_KEY});

  try {
    const response = await client.send(command);
    const stream = response.Body as Readable;
    const buf = await streamToBuffer(stream);
    const json = JSON.parse(buf.toString('utf-8'));
    const {x, y} = gothenburg || {};
    const {buildings} = parseCityModel(json, 'EPSG:3006', undefined, [
      x || 0,
      y || 0,
    ]); // should not be zero, typescript
    const {data, modelMatrix} = buildings;
    preprocessBuildings(data);
    res.status(200).json({buildings: data, modelMatrix});
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

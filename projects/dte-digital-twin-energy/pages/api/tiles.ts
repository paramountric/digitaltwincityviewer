import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import jwt from 'jsonwebtoken';
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

  const {x, y, z} = req.query;

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: `tiles/${z}/${x}/${y}.mvt`,
  });
  try {
    const response = await client.send(command);
    res.send(response.Body);
  } catch (err) {
    console.log(err);
    res.status(404).end();
  }
}

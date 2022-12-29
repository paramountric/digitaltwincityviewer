import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import jwt from 'jsonwebtoken';
import {convert} from '@dtcv/geojson';
import {cities} from '@dtcv/cities';

// ! this file is kept for reference, previously each file was loaded from S3
// the other file with buildings was blended with energy data, but now tiles is used instead

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
  S3_OBJECT_KEY_BUILDINGS_2050,
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

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: S3_OBJECT_KEY_BUILDINGS_2050,
  });

  try {
    const response = await client.send(command);
    const stream = response.Body as Readable;
    const buf = await streamToBuffer(stream);
    const json = JSON.parse(buf.toString('utf-8'));
    const {x, y} = gothenburg || {};
    convert(json, 'EPSG:3006', [x || 0, y || 0], true);
    res.status(200).json(json);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';

const {
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_ENDPOINT,
  S3_REGION,
  S3_BUCKET,
  S3_OBJECT_KEY,
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

export default async function handleGetUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const command = new GetObjectCommand({Bucket: S3_BUCKET, Key: S3_OBJECT_KEY});

  try {
    const data = await client.send(command);
    const json = data.Body;
    console.log(json);
    res.json(json);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

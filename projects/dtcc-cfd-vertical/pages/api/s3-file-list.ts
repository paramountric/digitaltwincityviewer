import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, ListObjectsCommand} from '@aws-sdk/client-s3';

const REGION = 'eu-north-1';
const BUCKET = 'dtcc-cfd-vertical';
const s3Client = new S3Client({region: REGION});

export default async function handleUploadFile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const getFileList = async () => {
    try {
      const data = await s3Client.send(
        new ListObjectsCommand({
          Bucket: BUCKET,
        })
      );
      console.log('Success', data);
      return data;
    } catch (err) {
      console.log('Error', err);
    }
  };

  const fileList = await getFileList();

  res.status(200).send(fileList);
}

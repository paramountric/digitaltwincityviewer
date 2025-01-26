import {S3Client} from '@aws-sdk/client-s3';

const REGION = 'eu-north-1';

const s3Client = new S3Client({region: REGION});

export function getS3Client() {
  return s3Client;
}

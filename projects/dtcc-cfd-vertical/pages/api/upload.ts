import type {NextApiRequest, NextApiResponse} from 'next';
import Busboy from 'busboy';
import {Upload} from '@aws-sdk/lib-storage';
import {S3Client, S3} from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handleUploadFile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // https://www.npmjs.com/package/busboy
  const busboy = Busboy({
    headers: req.headers,
  });

  busboy.on('file', async (name, file, info) => {
    const {filename} = info;

    console.log('file coming in ', filename);

    file
      .on('data', data => {
        console.log(`File [${name}] got ${data.length} bytes`);
      })
      .on('close', () => {
        console.log(`File [${name}] done`);
      });

    // https://www.npmjs.com/package/@aws-sdk/lib-storage
    try {
      const parallelUploads3 = new Upload({
        client:
          new S3({}) ||
          new S3Client({
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY,
              secretAccessKey: process.env.S3_SECRET_KEY,
            },
            endpoint: process.env.S3_UPLOAD_ENDPOINT,
            forcePathStyle: true,
            region: process.env.S3_UPLOAD_REGION || 'eu-north-1',
          }),
        params: {
          Bucket: process.env.S3_UPLOAD_BUCKET,
          Key: 'add-file-key-here',
          Body: file,
        },

        tags: [
          /*...*/
        ], // optional tags
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
      });

      parallelUploads3.on('httpUploadProgress', progress => {
        console.log(progress);
      });

      await parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }

    file.on('close', async () => {
      console.log('file close');
    });

    file.on('error', err => {
      console.log('file error', err);
    });
  });

  busboy.on('finish', async () => {
    res.status(201).send({
      fileId: 'need-to-put-file-id-here',
    });
  });

  busboy.on('error', async err => {
    console.log('error', err);
    res.status(400).end('Error uploading file');
  });

  req.pipe(busboy);
}

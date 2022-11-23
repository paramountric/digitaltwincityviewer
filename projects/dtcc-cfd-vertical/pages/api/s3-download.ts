import type {NextApiRequest, NextApiResponse} from 'next';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getS3Client} from '../../lib/s3-client';

// ! not used now, instead the client will know the public url
// todo: generate presigned url

const BUCKET = 'dtcc-cfd-vertical';
const s3Client = getS3Client();

//https://stackoverflow.com/questions/36942442/how-to-get-response-from-s3-getobject-in-node-js#36944450
function getObject(Bucket, Key) {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({Bucket, Key});

    try {
      const response = await s3Client.send(getObjectCommand);

      // Store all of data chunks returned from the response data stream
      // into an array then use Array#join() to use the returned contents as a String
      let responseDataChunks = [];

      // Handle an error while streaming the response body
      // response.Body.once('error', err => reject(err));

      // Attach a 'data' listener to add the chunks of data to our array
      // Each chunk is a Buffer instance
      // response.Body.on('data', chunk => responseDataChunks.push(chunk));

      // Once the stream has no more data, join the chunks into a string and return the string
      // response.Body.once('end', () => resolve(responseDataChunks.join('')));
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
}

//
export default async function handleDownloadFile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  res.status(200).send('this is not used, instead the client will use the pre');
}

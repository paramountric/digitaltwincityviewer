import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handleSync(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  // todo
  // check authentication
  // get streamId, and more from request?
  // check authorization
  // start a batch loading process to load branches, commits and objects into graph as entities
  // return some loading process id - or just let the ws push progress

  try {
    res.status(200).json({
      message: 'sync started',
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

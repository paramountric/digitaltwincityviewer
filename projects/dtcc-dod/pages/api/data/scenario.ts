import type {NextApiRequest, NextApiResponse} from 'next';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import jwt from 'jsonwebtoken';
import {parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {writeFileSync} from 'fs';
import energyData from './energyData.json';

const energyDataTyped: {
  [key: string]: any;
} = energyData;

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

const buildingEnergyProperties: {
  [uuid: string]: {
    [propertyKey: string]: number | number[];
  };
} = {};

// messy convenience function to fix data while iterating fast in the project, ideally the data is already coming in correctly
const preprocessBuildings = (
  buildings: any,
  b2050_4_5: any,
  b2050_8_5: any
) => {
  const propertyKeys2020 = [
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
  const propertyKeys2018 = [
    'deliveredEnergy2018',
    'deliveredEnergy2030',
    'deliveredEnergy2050',
    'primaryEnergy2018',
    'primaryEnergy2030',
    'primaryEnergy2050',
    'finalEnergy2018',
    'finalEnergy2030',
    'finalEnergy2050',
    'ghgEmissions2018',
    'ghgEmissions2030',
    'ghgEmissions2050',
    'heatDemand2018',
    'heatDemand2030',
    'heatDemand2050',
  ];
  for (const building of buildings) {
    buildingEnergyProperties[building.properties.uuid] = {
      monthlyFinalEnergy2020: building.properties.monthlyFinalEnergy2020,
      monthlyHeatDemand2020: building.properties.monthlyHeatDemand2020,
      monthlyFinalEnergy2030: building.properties.monthlyFinalEnergy2030,
      monthlyHeatDemand2030: building.properties.monthlyHeatDemand2030,
      monthlyFinalEnergy2050: building.properties.monthlyFinalEnergy2050,
      monthlyHeatDemand2050: building.properties.monthlyHeatDemand2050,
    };

    for (const propertyKey of propertyKeys2020) {
      buildingEnergyProperties[building.properties.uuid][propertyKey] =
        building.properties[propertyKey];
      buildingEnergyProperties[building.properties.uuid][`${propertyKey}M2`] =
        building.properties[propertyKey] / building.properties.heatedFloorArea;

      delete building.properties[propertyKey];
    }

    delete building.properties.monthlyFinalEnergy2018;
    delete building.properties.monthlyHeatDemand2018;
    delete building.properties.monthlyFinalEnergy2020;
    delete building.properties.monthlyHeatDemand2020;
    delete building.properties.monthlyFinalEnergy2030;
    delete building.properties.monthlyHeatDemand2030;
    delete building.properties.monthlyFinalEnergy2050;
    delete building.properties.monthlyHeatDemand2050;
  }

  for (const building of b2050_4_5) {
    Object.assign(buildingEnergyProperties[building.properties.uuid], {
      monthlyFinalEnergy2020_4_5: building.properties.monthlyFinalEnergy2018,
      monthlyHeatDemand2020_4_5: building.properties.monthlyHeatDemand2018,
      monthlyFinalEnergy2030_4_5: building.properties.monthlyFinalEnergy2030,
      monthlyHeatDemand2030_4_5: building.properties.monthlyHeatDemand2030,
      monthlyFinalEnergy2050_4_5: building.properties.monthlyFinalEnergy2050,
      monthlyHeatDemand2050_4_5: building.properties.monthlyHeatDemand2050,
    });

    for (const propertyKey of propertyKeys2018) {
      const key = `${propertyKey}_4_5`;
      buildingEnergyProperties[building.properties.uuid][key] =
        building.properties[propertyKey];
      buildingEnergyProperties[building.properties.uuid][`${key}M2`] =
        building.properties[propertyKey] / building.properties.heatedFloorArea;

      delete building.properties[propertyKey];
    }

    delete building.properties.monthlyFinalEnergy2018;
    delete building.properties.monthlyHeatDemand2018;
    delete building.properties.monthlyFinalEnergy2030;
    delete building.properties.monthlyHeatDemand2030;
    delete building.properties.monthlyFinalEnergy2050;
    delete building.properties.monthlyHeatDemand2050;
  }

  for (const building of b2050_8_5) {
    Object.assign(buildingEnergyProperties[building.properties.uuid], {
      monthlyFinalEnergy2020_8_5: building.properties.monthlyFinalEnergy2018,
      monthlyHeatDemand2020_8_5: building.properties.monthlyHeatDemand2018,
      monthlyFinalEnergy2030_8_5: building.properties.monthlyFinalEnergy2030,
      monthlyHeatDemand2030_8_5: building.properties.monthlyHeatDemand2030,
      monthlyFinalEnergy2050_8_5: building.properties.monthlyFinalEnergy2050,
      monthlyHeatDemand2050_8_5: building.properties.monthlyHeatDemand2050,
    });

    for (const propertyKey of propertyKeys2018) {
      const key = `${propertyKey}_8_5`;
      buildingEnergyProperties[building.properties.uuid][key] =
        building.properties[propertyKey];
      buildingEnergyProperties[building.properties.uuid][`${key}M2`] =
        building.properties[propertyKey] / building.properties.heatedFloorArea;

      delete building.properties[propertyKey];
    }

    delete building.properties.monthlyFinalEnergy2018;
    delete building.properties.monthlyHeatDemand2018;
    delete building.properties.monthlyFinalEnergy2030;
    delete building.properties.monthlyHeatDemand2030;
    delete building.properties.monthlyFinalEnergy2050;
    delete building.properties.monthlyHeatDemand2050;
  }

  writeFileSync('buildings.json', JSON.stringify(buildings));
  writeFileSync('energyData.json', JSON.stringify(buildingEnergyProperties));
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
  const setZCoordinateToZero = true;
  try {
    const response = await client.send(command);
    const stream = response.Body as Readable;
    const buf = await streamToBuffer(stream);
    const json = JSON.parse(buf.toString('utf-8'));
    for (const feature of json) {
      const featureEnergyData = energyDataTyped[feature.properties.uuid];
      const properties = Object.assign(
        {},
        feature.properties,
        featureEnergyData
      );
      feature.properties = properties;
    }
    res.status(200).json({buildings: json});

    // const {x, y} = gothenburg || {};
    // const {buildings} = parseCityModel(
    //   json,
    //   'EPSG:3006',
    //   undefined,
    //   [x || 0, y || 0],
    //   setZCoordinateToZero
    // ); // should not be zero, typescript
    // const {data, modelMatrix} = buildings;
    // // load energy data files
    // const fileName = S3_OBJECT_KEY?.split('.')[0];
    // const command_4_5 = new GetObjectCommand({
    //   Bucket: S3_BUCKET,
    //   Key: `${fileName}_4_5.json`,
    // });
    // const response_4_5 = await client.send(command_4_5);
    // const stream_4_5 = response_4_5.Body as Readable;
    // const buf_4_5 = await streamToBuffer(stream_4_5);
    // const json_4_5 = JSON.parse(buf_4_5.toString('utf-8'));

    // const {buildings: buildings_4_5} = parseCityModel(
    //   json_4_5,
    //   'EPSG:3006',
    //   undefined,
    //   [x || 0, y || 0],
    //   setZCoordinateToZero
    // );

    // const command_8_5 = new GetObjectCommand({
    //   Bucket: S3_BUCKET,
    //   Key: `${fileName}_8_5.json`,
    // });
    // const response_8_5 = await client.send(command_8_5);
    // const stream_8_5 = response_8_5.Body as Readable;
    // const buf_8_5 = await streamToBuffer(stream_8_5);
    // const json_8_5 = JSON.parse(buf_8_5.toString('utf-8'));

    // const {buildings: buildings_8_5} = parseCityModel(
    //   json_8_5,
    //   'EPSG:3006',
    //   undefined,
    //   [x || 0, y || 0],
    //   setZCoordinateToZero
    // );

    //preprocessBuildings(data, buildings_4_5.data, buildings_8_5.data);
    //res.status(200).json({buildings: data, modelMatrix});
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

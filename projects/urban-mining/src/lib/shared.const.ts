import getConfig from 'next/config';

const {
  publicRuntimeConfig: { tileServerUrl },
} = getConfig();

export const config = {
  tileServerUrl,
};

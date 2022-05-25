import fs from 'fs';
import path from 'path';

import { PROVIDERS_LIST } from '../../src/index';

const providersListToJson = (providers: any): string => {
  const providersJson = [];
  for (const provider of Object.keys(providers)) {
    for (const providerInstance of providers[provider]) {
      providersJson.push(providerInstance.toString);
    }
  }
  return JSON.stringify(providersJson, null, 2);
};

(() => {
  const providersJson = providersListToJson(PROVIDERS_LIST);
  fs.writeFileSync('./providers.json', providersJson);
})();

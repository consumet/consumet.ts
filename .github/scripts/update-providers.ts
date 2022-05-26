import fs from 'fs';

import { PROVIDERS_LIST } from '../../src/index';

const providersListToJson = (providers: any): string => {
  const providersJson: { [k: string]: unknown[] } = {};

  for (const provider of Object.keys(providers)) {
    providersJson[provider] = [];
    for (const providerInstance of providers[provider]) {
      providersJson[provider].push(providerInstance.toString);
    }
  }
  return JSON.stringify(providersJson, null, 2);
};

(() => {
  const providersJson = providersListToJson(PROVIDERS_LIST);
  fs.writeFileSync('./providers.json', providersJson);
})();

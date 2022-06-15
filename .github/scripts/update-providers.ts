import fs from 'fs';

import { PROVIDERS_LIST } from '../../src/index';

const providersListToJson = (providers: any): string => {
  const providersJson: [{ [k: string]: unknown[] }] = [{}];

  for (const { provider, i } of Object.keys(providers).map((provider, i) => ({ i, provider }))) {
    providersJson.push({
      [provider]: providers[provider].map((p: any) => p.toString),
    });

    providersJson[i + 1][provider].sort((a: any, b: any) =>
      a.name === b.name ? 0 : a.name < b.name ? -1 : 1
    );
  }

  providersJson.shift();

  return JSON.stringify(providersJson, null, 2);
};

(() => {
  const providersJson = providersListToJson(PROVIDERS_LIST);
  fs.writeFileSync('./providers.json', providersJson);
})();

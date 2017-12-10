import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {ensureFolderExists, emptyFolder} from './fsHelpers';
import * as yaml from 'js-yaml';

const locizeApiKey = '0065f3ba-87f4-4685-99ea-c90c22a89275';
const locizeProjectId = 'c9aeef33-f4c0-4e27-9d5a-63148b617dae';
const locizeNamespace = 'app';

const i18nFolder = path.resolve(__dirname, '../src/assets/i18n');
const generationFolder = path.resolve(i18nFolder, 'generated');
const dataFolder = path.resolve(generationFolder, 'data');
const messagesFolder = path.resolve(generationFolder, 'messages');

type Messages = {[key: string]: string | Messages};

export async function downloadI18n (version: string) {
  console.log('Downloading locales from locize.io');
  const locales = await downloadLocales(locizeProjectId);

  console.log('Downloading messages from locize.io');
  const allMessages = await Promise.all(
    locales.map((locale) =>
      downloadMessages(locizeProjectId, version, locale, locizeNamespace)
        .then((messages) => {
          console.log(`Finished downloading messages (${locale})`);
          return messages;
        })
    )
  );

  // Empty generation folders and/or make sure folders exist
  emptyFolder(dataFolder, (filename) => /\.js$/.test(filename));
  emptyFolder(messagesFolder, (filename) => /\.yml$/.test(filename));
  ensureFolderExists(dataFolder);
  ensureFolderExists(messagesFolder);

  const reference = readReference();

  console.log('Generating local i18n files');
  await Promise.all(
    locales.map((locale, index) =>
      generateI18n(locale, allMessages[index], locale === reference.locale)
        .then(() => console.log('Generated', locale))
    )
  );
}

export async function uploadI18n (version: string) {
  const {locale, ...messages} = readReference();
  console.log(`Uploading reference (${locale}) messages to locize.io`);
  return uploadMessages(locizeProjectId, version, locale, locizeNamespace, messages)
    .then(() => console.log('Finished uploading reference messages'));
}

function readReference () {
  return yaml.safeLoad(fs.readFileSync(path.resolve(i18nFolder, 'reference.yml'), 'utf8'));
}

function generateI18n (locale: string, messages: Messages, isReference: boolean) {
  const flattenedMessages = flattenMessages(messages);

  // Generate localeData import and messages yaml
  const dataRequireJs = `export default require('react-intl/locale-data/${locale}');\n`;
  const messagesYaml = yaml.safeDump(flattenedMessages);

  // Generate messages
  const writes = [
    {filename: path.join(dataFolder, `${locale}.js`), data: dataRequireJs}
  ];

  // The reference language messages are already defined in assets/i18n/reference.yml
  if (!isReference) {
    writes.push(
      {filename: path.join(messagesFolder, `${locale}.yml`), data: messagesYaml}
    );
  }

  const writePromises = writes.map(({filename, data}) =>
    new Promise((resolve, reject) =>
      fs.writeFile(
        filename, data,
        (err) => err ? reject(err) : resolve()
      )
    )
  );

  // Wait for all messages to be written to filesystem
  return Promise.all(writePromises);
}

function flattenMessages (messages: Messages, p: string[] = [], flattened: {[key: string]: string} = {}) {
  for (const key in messages) {
    const extendedPath = p.concat(key);
    const value = messages[key];
    if (typeof value === 'string') {
      const absolutePath = extendedPath.join('.');
      flattened[absolutePath] = value;
    } else {
      flattenMessages(value, extendedPath, flattened);
    }
  }
  return flattened;
}

async function downloadLocales (projectId: string): Promise<string[]> {
  const response = await axios.get(`https://api.locize.io/languages/${projectId}`);
  return Object.keys(response.data);
}

async function downloadMessages (projectId: string, version: string, locale: string, ns: string) {
  const response = await axios.get(`https://api.locize.io/${projectId}/${version}/${locale}/${ns}`);
  return response.data as {[key: string]: string};
}

async function uploadMessages (projectId: string, version: string, locale: string, ns: string, messages: Messages) {
  return axios.post(`https://api.locize.io/update/${projectId}/${version}/${locale}/${ns}?replace=true`, messages, {
    headers: {
      Authorization: `Bearer ${locizeApiKey}`
    }
  });
}

if (require.main === module) {
  const method = process.argv[2];
  const version = process.argv[3];
  switch (method) {
    case 'upload': uploadI18n(version); break;
    case 'download': downloadI18n(version); break;
  }
}

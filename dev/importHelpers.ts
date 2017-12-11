const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sox = require('sox');
const os = require('os');
const {split_fsb, extract_fsb, clean_audio_names} = require('darkest_dungeon_tools');
const {removeFolder, ensureFolderExists, copyFiles} = require('./fsHelpers');

// Paths

export let folders: any = {
  localDDAssets: path.join(__dirname, '../src/assets/dd'),
  fsbExtractBinaryPath: path.join(__dirname, '../bin/extract_fsb.exe'),
  steam: process.argv[2],
};

folders = {
  ...folders,
  localDDAudio: path.join(folders.localDDAssets, 'audio'),
  localDDAudioRaw: path.join(folders.localDDAssets, 'audio_raw'),
  localDDImages: path.join(folders.localDDAssets, 'images'),
  dd: path.join(folders.steam, 'steamapps/common/DarkestDungeon'),
};

folders.ddAudio = path.join(folders.dd, 'audio');

if (!fs.existsSync(folders.dd)) {
  console.error('Could not find Darkest Dungeon folder: ' + folders.dd);
  process.exit(1);
}

// Audio

export function importAudio (audioToImport: {}) {
  removeFolder(folders.localDDAudio);
  removeFolder(folders.localDDAudioRaw);
  ensureFolderExists(folders.localDDAudio);
  ensureFolderExists(folders.localDDAudioRaw);

  return extractAudioFromDD(audioToImport)
    .then(() => clean_audio_names.clean_directory.sync(folders.localDDAudioRaw))
    .then(() => {
      const cpuCount = os.cpus().length;
      const conversions = getAudioConversions(folders.localDDAudioRaw, folders.localDDAudio);
      console.log('Converting ' + conversions.length + ' files, ' + cpuCount + ' files at a time');
      return new Promise((resolve) => {
        convertAudioInBatch(resolve, conversions, cpuCount);
      });
    }).then(() => removeFolder(folders.localDDAudioRaw));
}

export function getAudioBankNames (paths: {[key: string]: string[]}) {
  const bankNames: {[key: string]: string[]} = {};
  for (const folder in paths) {
    if (!paths[folder] || paths[folder].length === 0) {
      // Get all banks in the folder if no custom banks are specified
      const folderPath = path.join(folders.ddAudio, folder);
      bankNames[folder] = fs.readdirSync(folderPath).filter(
        (f: string) => fs.statSync(path.join(folderPath, f)).isFile()
      );
    } else {
      // Make sure custom bank names have .bank extensions
      bankNames[folder] = paths[folder].map(
        (bankName) => /\.bank$/.test(bankName) ? bankName : bankName + '.bank'
      );
    }
  }
  return bankNames;
}

export function extractAudioFromDD (audioToImport: {[key: string]: string[]}) {
  const extractPromises: Promise<void>[] = [];
  for (const categoryName in audioToImport) {
    audioToImport[categoryName].forEach((bankFile) => {
      const bankPath = path.join(folders.ddAudio, categoryName, bankFile);
      const fsbPath = path.join(folders.localDDAudioRaw, bankFile);
      console.log('Importing', bankPath);

      // Wait for each extraction
      extractPromises.push(
        new Promise((resolve) => {
          // Create an fsb file to use for extraction
          split_fsb.async(bankPath, fsbPath, () => {
            // Extract audio files from bank
            const childProcess = extract_fsb.extract(
              fsbPath,
              folders.localDDAudioRaw,
              folders.fsbExtractBinaryPath
            );

            // Let the child process determine when extraction is done
            childProcess.on('exit', () => {
              fs.unlinkSync(fsbPath); // Remove the fsb file as we're now done with it
              console.log('Finished importing', bankPath);
              resolve();
            });
          });
        })
      );
    });
  }

  // We're finished when all extractions are done
  return Promise.all(extractPromises);
}

type Conversion = {
  inputFile: string,
  outputFile: string
};

export function getAudioConversions (inputDir: string, outputDir: string): Conversion[] {
  const inputFiles = fs.readdirSync(inputDir).filter(
    (f: string) => fs.statSync(path.join(inputDir, f)).isFile()
  );

  return inputFiles.map((waveFilename: string) => {
    const name = path.basename(waveFilename, '.wav');
    const inputFile = path.join(inputDir, waveFilename);
    const outputFile = path.join(outputDir, name + '.ogg');
    return {inputFile, outputFile};
  });
}

export function convertAudioInBatch (
  resolve: () => void, pool: Conversion[], batchSize: number, batch: Conversion[] = []
) {
  while (batch.length < batchSize && pool.length > 0) {
    const conversion = pool.pop();
    batch.push(conversion);
    convertAudio(conversion).then(() => {
      batch.splice(batch.indexOf(conversion), 1);
      convertAudioInBatch(resolve, pool, batchSize, batch);
    });
  }

  if (pool.length === 0 && batch.length === 0) {
    resolve();
  }
}

export function convertAudio ({inputFile, outputFile}: Conversion) {
  const job = sox.transcode(inputFile, outputFile, {
    format: 'ogg',
    bitRate: 1,
    compressionQuality: 5
  });

  return new Promise((resolve) => {
    job.on('error', (e: any) => console.error(e));
    job.on('end', () => {
      console.log('Converted', outputFile);
      resolve();
    });
    job.start();
  });
}


// Image

export function importImages (ddPaths: string[]) {
  return new Promise((resolve) => {
    removeFolder(folders.localDDImages);
    ensureFolderExists(folders.localDDImages);

    const localPaths = ddPaths.map((p) => path.join(folders.localDDImages, p.replace(folders.dd, '')));
    copyFiles(ddPaths, localPaths);

    resolve();
  });
}

export function getImagePaths (queries: string[]) {
  return queries.reduce(
    (paths, query) => {
      const fullQuery = path.join(folders.dd, query);
      console.log(fullQuery);
      glob.sync(fullQuery).forEach((p: string) => {
        paths.push(path.normalize(p));
      });
      return paths;
    },
    [] as string[]
  );
}

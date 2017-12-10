import * as path from 'path';
import * as fs from 'fs';

export function ensureFolderExists (folderPath: string) {
  folderPath.split(path.sep)
    .reduce(
      (pathBase, folderName) => {
        const currentPath = path.resolve(pathBase, folderName);
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }

        return currentPath;
      },
      path.isAbsolute(folderPath) ? path.sep : ''
    );
}

export function removeFolder (folderPath: string) {
  emptyFolder(folderPath);
  fs.rmdirSync(folderPath);
}

export function emptyFolder (folderPath: string, test = (f: string) => true) {
  if (!fs.existsSync(folderPath)) {
    return;
  }

  fs.readdirSync(folderPath).forEach((file) => {
    const curPath = path.join(folderPath, file);
    if (fs.lstatSync(curPath).isDirectory()) { // recurse
      removeFolder(curPath);
    } else if (test(file)) { // delete file
      fs.unlinkSync(curPath);
    }
  });
}

export function copyFiles (sourceList: string[], destList: string[]) {
  for (let i = 0; i < sourceList.length; i += 1) {
    const source = sourceList[i];
    const dest = destList[i];
    ensureFolderExists(path.dirname(dest));
    fs.createReadStream(source).pipe(fs.createWriteStream(dest));
  }
}

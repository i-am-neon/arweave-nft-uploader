import { readdirSync, statSync, readFileSync } from 'fs';
import { Metadata } from './types/Metadata';

export const getFileSizeInBytes = (path: string): number => {
  return statSync(path).size;
};

export const getDirSizeInBytes = (path: string): number => {
  const fileNames = readdirSync(path);
  let imageBytesTotal = 0;
  fileNames.forEach((fileName) => {
    imageBytesTotal += getFileSizeInBytes(path + '/' + fileName);
  });
  return imageBytesTotal;
};

export const getPathSizeInBytes = (path: string): number => {
  try {
    if (statSync(path).isDirectory()) {
      return getDirSizeInBytes(path);
    } else {
      return getFileSizeInBytes(path);
    }
  } catch (error) {
    throw new Error('Path does not exist.');
  }
};

export const getImageContentType = (path: string): string => {
  const type = path.split('.').pop();
  return 'image/' + type;
};

export const getListFromFullMetadata = (fullMetadataPath: string): Metadata[] => {
  return JSON.parse(readFileSync(fullMetadataPath, 'utf8'));
};

export const updateMetadataWithImageURI = (metadataJSON: Metadata, imageURI: string): Metadata => {
  metadataJSON.image = imageURI;
  return metadataJSON;
};

// exports = {
//     getFileSizeInBytes,
//     getDirSizeInBytes,
//     getPathSizeInBytes,
//     getImageContentType,
//     getListFromFullMetadata,
//     updateMetadataWithImageURI
// }

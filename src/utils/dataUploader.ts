import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { readFileSync } from 'fs';
import { Metadata } from '../types/Metadata';
import { uploadDataToArweave } from './arweaveUtils';
import { getImageContentType } from './fileUtils';

const uploadImageFromPath = async (arweave: Arweave, key: JWKInterface, path: string): Promise<string> => {
  const data = readFileSync(path);
  const contentType = getImageContentType(path);
  console.log('========');
  console.log('in uploadImageFromPath, about to upload data to arweave:');
  console.log('data :>> ', data);
  console.log('contentType :>> ', contentType);
  console.log('========');
  return await uploadDataToArweave(arweave, key, data, contentType);
};

const uploadSingleMetadata = async (arweave: Arweave, key: JWKInterface, metadata: Metadata): Promise<string> => {
  const metadataString = JSON.stringify(metadata);
  const contentType = 'text/json';
  console.log('========');
  console.log('in uploadImageFromPath, about to upload data to arweave:');
  console.log('metadataString :>> ', metadataString);
  console.log('contentType :>> ', contentType);
  console.log('========');

  return await uploadDataToArweave(arweave, key, metadataString, contentType);
};

export { uploadImageFromPath, uploadSingleMetadata };

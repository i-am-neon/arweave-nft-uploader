import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { readdirSync, readFileSync } from 'fs';
import { connectToArweave, connectToLocalArweave } from '..';
import { Metadata } from '../types/Metadata';
import { getTxnURI } from './arweaveUtils';
import { uploadImageFromPath, uploadSingleMetadata } from './dataUploader';
import { getListFromFullMetadata, updateMetadataWithImageURI } from './fileUtils';

export default class ArweaveNftUploader {
  arweaveInstance: Arweave;
  key: JWKInterface;
  isMainnet: boolean;

  constructor(_arweaveInstance: Arweave, _key: JWKInterface, _isMainnet: boolean) {
    this.arweaveInstance = _arweaveInstance;
    this.key = _key;
    this.isMainnet = _isMainnet;
  }

  uploadSingleImagePathAndMetadataPath = async (imagePath: string, metadataPath: string): Promise<string> => {
    return await this.uploadSingleImagePathAndMetadataObject(imagePath, JSON.parse(readFileSync(metadataPath, 'utf8')));
  };

  uploadSingleImagePathAndMetadataObject = async (imagePath: string, metadata: Metadata): Promise<string> => {
    const imageTx = await uploadImageFromPath(this.arweaveInstance, this.key, imagePath);
    const imageURI = getTxnURI(imageTx, this.isMainnet);
    const metadataToUpload = updateMetadataWithImageURI(metadata, imageURI);
    const metadataTx = await uploadSingleMetadata(this.arweaveInstance, this.key, metadataToUpload);
    return getTxnURI(metadataTx, this.isMainnet);
  };

  uploadImageDirAndFullMetadataFile = async (imageDirPath: string, fullMetadataPath: string): Promise<string[]> => {
    const imageFiles = readdirSync(imageDirPath);
    const metadataObjects = getListFromFullMetadata(fullMetadataPath);

    if (imageFiles.length !== metadataObjects.length) {
      throw new Error('The count of images does not equal the count of metadata objects.');
    }

    const metadataURIs: string[] = [];
    for (const fileName of imageFiles) {
      const currentMetadata = metadataObjects.shift();
      const metadataURI = await this.uploadSingleImagePathAndMetadataObject(
        imageDirPath + '/' + fileName,
        currentMetadata!,
      );
      metadataURIs.push(metadataURI);
    }

    return metadataURIs;
  };
}

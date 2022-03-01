import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { readdirSync, readFileSync } from 'fs';
import { connectToArweave, connectToLocalArweave } from '..';
import { Metadata } from '../types/Metadata';
import { getTxnURI } from './arweaveUtils';
import { uploadImage, uploadSingleMetadata } from './dataUploader';
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
    console.log('========');
    console.log('calling uploadSingleImagePathAndMetadataObject with params:');
    console.log('imagePath :>> ', imagePath);
    console.log('metadata :>> ', metadata);
    console.log('========');
    const imageTx = await uploadImage(this.arweaveInstance, this.key, imagePath);
    console.log('back in uploadSingleImagePathAndMetadataObject, just got imageTx:', imageTx);
    
    const imageURI = getTxnURI(imageTx, this.isMainnet);
    console.log('imageURI :>> ', imageURI);
    const metadataToUpload = updateMetadataWithImageURI(metadata, imageURI);
    console.log('metadataToUpload :>> ', metadataToUpload);
    const metadataTx = await uploadSingleMetadata(this.arweaveInstance, this.key, metadataToUpload);
    console.log('metadataTx :>> ', metadataTx);
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

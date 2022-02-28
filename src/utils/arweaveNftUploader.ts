import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { readdirSync } from 'fs';
import { Metadata } from "../types/Metadata";
import { getTxnURI } from "./arweaveUtils";
import { uploadImage, uploadSingleMetadata } from "./dataUploader";
import { getListFromFullMetadata, updateMetadataWithImageURI } from "./fileUtils";

export class ArweaveNftUploader {
    key: JWKInterface;
    isMainnet: boolean;

    constructor(_key: JWKInterface, _isMainnet: boolean) {
        this.key = _key;
        this.isMainnet = _isMainnet;
    }
}

const uploadImageAndMetadata = async (
    arweave: Arweave,
    key: JWKInterface,
    imagePath: string,
    metadata: Metadata,
    isProd: boolean
)
    : Promise<string> => {
    const imageTx = await uploadImage(arweave, key, imagePath);
    const imageURI = getTxnURI(imageTx, isProd);
    const metadataToUpload = updateMetadataWithImageURI(metadata, imageURI);
    const metadataTx = await uploadSingleMetadata(arweave, key, metadataToUpload);
    return getTxnURI(metadataTx, isProd);
}

const uploadImageDirAndFullMetadataFile = async (
    arweave: Arweave,
    key: JWKInterface,
    imageDirPath: string,
    fullMetadataPath: string,
    isProd: boolean
)
    : Promise<string[]> => {
    const imageFiles = readdirSync(imageDirPath);
    const metadataObjects = getListFromFullMetadata(fullMetadataPath);

    if (imageFiles.length !== metadataObjects.length) {
        throw new Error("The count of images does not equal the count of metadata objects.");
    }

    let metadataURIs: string[] = [];
    for (const fileName of imageFiles) {
        const currentMetadata = metadataObjects.shift();
        const metadataURI = await uploadImageAndMetadata(arweave, key, imageDirPath + '/' + fileName, currentMetadata!, isProd);
        metadataURIs.push(metadataURI);
    }

    return metadataURIs;
}

export {
    uploadImageAndMetadata,
    uploadImageDirAndFullMetadataFile
}
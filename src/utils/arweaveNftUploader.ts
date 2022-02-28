import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { readdirSync } from 'fs';
import { connectToArweave, connectToLocalArweave } from "..";
import { Metadata } from "../types/Metadata";
import { getTxnURI } from "./arweaveUtils";
import { uploadImage, uploadSingleMetadata } from "./dataUploader";
import { getListFromFullMetadata, updateMetadataWithImageURI } from "./fileUtils";

export default class ArweaveNftUploader {
    arweaveInstance: Arweave;
    key: JWKInterface;
    isMainnet: boolean;
    
    constructor(_arweaveInstance: Arweave, _key: JWKInterface, _isMainnet: boolean) {
        this.arweaveInstance = _arweaveInstance;
        this.key = _key;
        this.isMainnet = _isMainnet;
    }
    
    uploadSingleImageAndMetadataObject = async (
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
    
    uploadImageDirAndFullMetadataFile = async (
        imageDirPath: string,
        fullMetadataPath: string,
    )
        : Promise<string[]> => {
        const imageFiles = readdirSync(imageDirPath);
        const metadataObjects = getListFromFullMetadata(fullMetadataPath);
    
        if (imageFiles.length !== metadataObjects.length) {
            throw new Error("The count of images does not equal the count of metadata objects.");
        }
    
        const metadataURIs: string[] = [];
        for (const fileName of imageFiles) {
            const currentMetadata = metadataObjects.shift();
            const metadataURI = await this.uploadSingleImageAndMetadataObject(this.arweaveInstance, this.key, imageDirPath + '/' + fileName, currentMetadata!, this.isMainnet);
            metadataURIs.push(metadataURI);
        }
    
        return metadataURIs;
    }
}

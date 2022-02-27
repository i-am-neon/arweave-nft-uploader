import { connectToArweave, connectToLocalArweave, generateTestKey, uploadDataToArweave } from "./utils/arweaveUtils";
import { getCostOfOneARInDollars, getCostToSavePathToArweaveInDollars, getCostToSavePathToArweaveInWinstons } from "./utils/costEstimator";
// import { uploadImageDirAndMetadataFile } from "./utils/imageAndMetadataUploader";
// import { ARWEAVE_KEY } from "./utils/secrets";


const manuallyTestSavingImagesCost = async () => {
    const imageCost = await getCostToSavePathToArweaveInDollars('src/testData/testImages');
    const metadataCost = await getCostToSavePathToArweaveInDollars('src/testData/testMetadata/testMetadata.json');
    const totalCost = imageCost + metadataCost;

    console.log('totalCost in dollars :>> ', totalCost);

}

const manuallyTestRealArweaveConnection = async () => {
    const arweave = connectToArweave();
    console.log('arweave :>> ', arweave);
}

// const getRealArweaveKey = () => {
//     console.log('ARWEAVE_KEY :>> ', ARWEAVE_KEY);
// }

// const testLocalBulkUpload = async () => {
//     const { arLocal, arweave } = await connectToLocalArweave();

//     const key = await generateTestKey(arweave);

//     const imageDir = 'src/testData/testImages';
//     const fullMetadata = 'src/testData/testMetadata/testMetadata.json';

//     const result = await uploadImageDirAndMetadataFile(arweave, key, imageDir, fullMetadata, false);

//     console.log('result :>> ', result);
// }

// const testRealBulkUpload = async () => {
//     const arweave = connectToArweave();

//     const key = ARWEAVE_KEY;

//     const imageDir = 'src/testData/testImages';
//     const fullMetadata = 'src/testData/testMetadata/testMetadata.json';

//     const result = await uploadImageDirAndMetadataFile(arweave, key, imageDir, fullMetadata, true);

//     console.log('result :>> ', result);
// }

// manuallyTestSavingImagesCost();

manuallyTestRealArweaveConnection();

// getRealArweaveKey();

// testLocalBulkUpload();

// testRealBulkUpload();
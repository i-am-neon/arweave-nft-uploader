// import Arweave from 'arweave';
const Arweave = require('arweave');
import { readFileSync } from 'fs';
import * as arweaveUtils from '../utils/arweaveUtils';
import testArweaveKey from '../testData/testArweaveKey.json';
import { uploadImage, uploadSingleMetadata } from '../utils/dataUploader';
import testMetadata from '../testData/testMetadata/1.json';

describe('dataUploader', () => {
    let arweave: typeof Arweave;

    beforeEach(() => {
        arweave = Arweave.init({});
    });

    it('should save an image to Arweave', async () => {
        const path = 'src/testData/testImages/1.jpg';
        const expectedData = readFileSync(path);
        const expectedContentType = 'image/jpg';
        const expectedImageTx = '123abc';
        const spy_arweaveUtils_uploadDataToArweave = jest.spyOn(arweaveUtils, 'uploadDataToArweave')
            .mockReturnValueOnce(Promise.resolve(expectedImageTx));

        const actualImageTx = await uploadImage(arweave, testArweaveKey, path);

        expect(spy_arweaveUtils_uploadDataToArweave).toBeCalledWith(arweave, testArweaveKey, expectedData, expectedContentType);
        expect(expectedImageTx).toBe(actualImageTx);
    });

    it('should upload a single piece of metadata', async () => {
        const metadataString = JSON.stringify(testMetadata);
        const expectedContentType = 'text/json';
        const expectedMetadataTx = '123abc';
        const spy_arweaveUtils_uploadDataToArweave = jest.spyOn(arweaveUtils, 'uploadDataToArweave')
            .mockReturnValueOnce(Promise.resolve(expectedMetadataTx));

        const actualMetadataTx = await uploadSingleMetadata(arweave, testArweaveKey, testMetadata);

        expect(spy_arweaveUtils_uploadDataToArweave).toBeCalledWith(arweave, testArweaveKey, metadataString, expectedContentType);
        expect(expectedMetadataTx).toBe(actualMetadataTx);
    });
});

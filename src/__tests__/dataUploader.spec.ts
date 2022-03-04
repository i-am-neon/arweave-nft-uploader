// import Arweave from 'arweave';
const Arweave = require('arweave');
import { readFileSync } from 'fs';
import * as arweaveUtils from '../utils/arweaveUtils';
import testArweaveKey from '../testData/testArweaveKey.json';
import { uploadImageFromPath, uploadSingleMetadata } from '../utils/dataUploader';
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
    const spyArweaveUtilsUploadDataToArweave = jest
      .spyOn(arweaveUtils, 'uploadDataToArweave')
      .mockResolvedValueOnce(expectedImageTx);

    const actualImageTx = await uploadImageFromPath(arweave, testArweaveKey, path);

    expect(spyArweaveUtilsUploadDataToArweave).toBeCalledWith(
      arweave,
      testArweaveKey,
      expectedData,
      expectedContentType,
    );
    expect(expectedImageTx).toBe(actualImageTx);
  });

  it('should upload a single piece of metadata', async () => {
    const metadataString = JSON.stringify(testMetadata);
    const expectedContentType = 'text/json';
    const expectedMetadataTx = '123abc';
    const spyArweaveUtilsUploadDataToArweave = jest
      .spyOn(arweaveUtils, 'uploadDataToArweave')
      .mockResolvedValueOnce(expectedMetadataTx);

    const actualMetadataTx = await uploadSingleMetadata(arweave, testArweaveKey, testMetadata);

    expect(spyArweaveUtilsUploadDataToArweave).toBeCalledWith(
      arweave,
      testArweaveKey,
      metadataString,
      expectedContentType,
    );
    expect(expectedMetadataTx).toBe(actualMetadataTx);
  });
});

import {
  getFileSizeInBytes,
  getDirSizeInBytes,
  getPathSizeInBytes,
  getImageContentType,
  getListFromFullMetadata,
  updateMetadataWithImageURI,
} from '../fileUtils';
import * as metadata1 from '../testData/testMetadata/1.json';
import * as metadata2 from '../testData/testMetadata/2.json';
import * as metadata3 from '../testData/testMetadata/3.json';
import * as metadata4 from '../testData/testMetadata/4.json';
import { Metadata } from '../types/Metadata';

const currentMachineIsWindows = process.platform === 'win32';

describe('fileUtils', () => {
  it('should get the size of a given file in bytes', () => {
    const path = 'src/testData/has24Bytes.txt';
    const expectedBytes = 24;

    const actualBytes = getFileSizeInBytes(path);

    expect(actualBytes).toBe(expectedBytes);
  });

  it('should get the size of a given directory in bytes', () => {
    const path = 'src/testData/has123BytesDir';
    const expectedBytesMac = 123;
    const expectedBytesWindows = 126;

    const actualBytes = getDirSizeInBytes(path);

    if (currentMachineIsWindows) {
      expect(actualBytes).toBe(expectedBytesWindows);
    } else {
      expect(actualBytes).toBe(expectedBytesMac);
    }
  });

  it('should get size of file if path is to a file', () => {
    const expectedBytes = 24;
    const path = 'src/testData/has24Bytes.txt';

    const actualBytes = getPathSizeInBytes(path);

    expect(actualBytes).toBe(expectedBytes);
  });

  it('should get size of dir if path is to a dir', () => {
    const path = 'src/testData/has123BytesDir';
    const expectedBytesMac = 123;
    const expectedBytesWindows = 126;

    const actualBytes = getPathSizeInBytes(path);

    if (currentMachineIsWindows) {
      expect(actualBytes).toBe(expectedBytesWindows);
    } else {
      expect(actualBytes).toBe(expectedBytesMac);
    }
  });

  it('should throw an error if path does not exist', () => {
    expect(() => getPathSizeInBytes('./doesNotExist')).toThrow('Path does not exist.');
  });

  it('should detect the content type of a given image', () => {
    const pathToJpg = 'src/testData/testImages/1.jpg';
    expect(getImageContentType(pathToJpg)).toBe('image/jpg');

    const pathToJpeg = 'src/testData/testImages/2.jpeg';
    expect(getImageContentType(pathToJpeg)).toBe('image/jpeg');

    const pathToPng = 'src/testData/testImages/4.png';
    expect(getImageContentType(pathToPng)).toBe('image/png');
  });

  it('should return a correctly ordered list from a given full metadata file path', () => {
    const fullMetadataPath = 'src/testData/testMetadata/testMetadata.json';
    const metadataList = getListFromFullMetadata(fullMetadataPath);

    expect(metadataList[0]).toEqual(metadata1);
    expect(metadataList[1]).toEqual(metadata2);
    expect(metadataList[2]).toEqual(metadata3);
    expect(metadataList[3]).toEqual(metadata4);
  });

  it('should replace the image property of a given metadata json with the given image URI', () => {
    const imageURI = 'abc123';
    const metadataBeforeUpdate: Metadata = {
      name: 'Business Doge',
      description: 'The doges living immutably on Ethereum and Arweave have come to take over the metaverse!',
      image: '',
      attributes: [
        {
          trait_type: 'Favorite Color',
          value: 'Black',
        },
        {
          trait_type: 'Cuteness Level',
          value: 'Too much',
        },
        {
          trait_type: 'Fur Type',
          value: 'Sharp',
        },
      ],
    };
    const expectedMetadataAfterUpdate: Metadata = {
      name: 'Business Doge',
      description: 'The doges living immutably on Ethereum and Arweave have come to take over the metaverse!',
      image: imageURI,
      attributes: [
        {
          trait_type: 'Favorite Color',
          value: 'Black',
        },
        {
          trait_type: 'Cuteness Level',
          value: 'Too much',
        },
        {
          trait_type: 'Fur Type',
          value: 'Sharp',
        },
      ],
    };

    const actualMetadataAfterUpdate = updateMetadataWithImageURI(metadataBeforeUpdate, imageURI);

    expect(expectedMetadataAfterUpdate).toEqual(actualMetadataAfterUpdate);
  });
});

import axios from 'axios';
import {
  getCostOfOneARInDollars,
  getCostToSavePathToArweaveInAR,
  getCostToSavePathToArweaveInDollars,
  getCostToSavePathToArweaveInWinstons,
  winstonsToAR,
} from '../utils/costEstimator';
import * as fileUtils from '../utils/fileUtils';
import * as arweaveUtils from '../utils/arweaveUtils';

const WINSTONS_PER_AR = 1e12;

describe('Arweave cost estimator', () => {
  const mockedARCostInDollars = 30;
  const axiosReturnValue = {
    data: {
      arweave: {
        usd: mockedARCostInDollars,
      },
    },
  };
  jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve(axiosReturnValue));

  it('should convert Winstons to AR', () => {
    const winstons = 500000;
    const expectedAR = winstons / WINSTONS_PER_AR;

    const actualAR = winstonsToAR(winstons);

    expect(expectedAR).toBe(actualAR);
  });

  it('should get the price of AR in dollars', async () => {
    const actualCostInDollars = await getCostOfOneARInDollars();

    expect(mockedARCostInDollars).toBe(actualCostInDollars);
  });

  it('should get the cost in Winstons of saving a given directory', async () => {
    const bytes = 100;
    const costInWinstons = 99999;
    const spy_fileUtils_getPathSizeInBytes = jest.spyOn(fileUtils, 'getPathSizeInBytes').mockReturnValueOnce(bytes);
    const spy_fileUtils_getArweavePriceForBytesInWinstons = jest
      .spyOn(arweaveUtils, 'getArweavePriceForBytesInWinstons')
      .mockReturnValueOnce(Promise.resolve(costInWinstons));

    const actualCost = await getCostToSavePathToArweaveInWinstons('');

    expect(actualCost).toBe(costInWinstons);
    expect(spy_fileUtils_getPathSizeInBytes).toBeCalledTimes(1);
    expect(spy_fileUtils_getArweavePriceForBytesInWinstons).toBeCalledWith(bytes);
  });

  it('should get the cost in AR of saving a given directory', async () => {
    const bytes = 100;
    const costInWinstons = 99999;
    jest.spyOn(fileUtils, 'getPathSizeInBytes').mockReturnValue(bytes);
    jest.spyOn(arweaveUtils, 'getArweavePriceForBytesInWinstons')
      .mockReturnValue(Promise.resolve(costInWinstons));
    const expectedCost = await getCostToSavePathToArweaveInWinstons('')
      .then((costInWinstons: number) => winstonsToAR(costInWinstons));

    const actualCost = await getCostToSavePathToArweaveInAR('');

    expect(actualCost).toBe(expectedCost);
  });

  it('should get the cost in Dollars of saving a given directory', async () => {
    const bytes = 100;
    const costInWinstons = 50000;
    const costInAR = costInWinstons / WINSTONS_PER_AR;
    const expectedCostInDollars = costInAR * mockedARCostInDollars;

    // have getArweavePriceForBytesInWinstons(...) return costInWinstons
    jest.spyOn(fileUtils, 'getPathSizeInBytes').mockReturnValueOnce(bytes);
    jest.spyOn(arweaveUtils, 'getArweavePriceForBytesInWinstons').mockReturnValueOnce(Promise.resolve(costInWinstons));

    const actualCostInDollars = await getCostToSavePathToArweaveInDollars('');

    expect(actualCostInDollars).toBe(expectedCostInDollars);
  });
});

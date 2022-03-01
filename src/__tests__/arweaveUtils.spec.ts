import axios, { AxiosResponse } from 'axios';
import ArLocal from 'arlocal';
import Arweave from 'arweave';
import {
  getArweavePriceForBytesInWinstons,
  connectToLocalArweave,
  generateTestKey,
  uploadDataToArweave,
  connectToArweave,
  getTxnURI,
  mintTestWinstonsToKey,
} from '../utils/arweaveUtils';
import Transaction from 'arweave/node/lib/transaction';
import { TransactionUploader } from 'arweave/node/lib/transaction-uploader';
import testArweaveKey from '../testData/testArweaveKey.json';
import Api from 'arweave/node/lib/api';
import { ARLOCAL_BASE_URL, ARWEAVE_BASE_URL } from '../constants';

const mockedAxiosResponseTypeUnknown: AxiosResponse<unknown> = {
  data: null,
  status: 200,
  statusText: 'success',
  headers: {},
  config: {},
};

describe('arweaveUtils', () => {
  it('should get cost of saving a given number of bytes to Arweave', async () => {
    const costInWinstons = 5000;
    const bytes = 123;
    const axiosReturnValue = { data: costInWinstons.toString() };
    const spyAxiosGet = jest.spyOn(axios, 'get').mockResolvedValueOnce(axiosReturnValue);

    const result = await getArweavePriceForBytesInWinstons(bytes);

    expect(spyAxiosGet).toHaveBeenCalledTimes(1);
    expect(result).toBe(costInWinstons);
  });

  it('should save data to Arweave', async () => {
    const arweave = Arweave.init({});
    const key = testArweaveKey;
    const data = 'data';
    const contentType = 'text/json';
    const tx = new Transaction();
    await arweave.transactions.sign(tx, key);
    const txUploader = new TransactionUploader(new Api({}), tx);
    // Allow the uploader to enter the while loop once, then set as complete
    jest.spyOn(txUploader, 'isComplete', 'get').mockReturnValueOnce(false);
    jest.spyOn(txUploader, 'isComplete', 'get').mockReturnValueOnce(true);
    const spyArweaveCreateTransaction = jest.spyOn(arweave, 'createTransaction').mockResolvedValueOnce(tx);
    const spyTransactionAddTag = jest.spyOn(Transaction.prototype, 'addTag');
    const spyArweaveTransactionsSign = jest.spyOn(arweave.transactions, 'sign').mockResolvedValueOnce();
    const spyArweaveTransactionsGetUploader = jest
      .spyOn(arweave.transactions, 'getUploader')
      .mockResolvedValueOnce(txUploader);
    const spyTransactionUploaderUploadChunk = jest
      .spyOn(TransactionUploader.prototype, 'uploadChunk')
      .mockResolvedValueOnce();

    const txId = await uploadDataToArweave(arweave, key, data, contentType);

    expect(spyArweaveCreateTransaction).toBeCalledTimes(1);
    expect(spyTransactionAddTag).toBeCalledWith('Content-Type', contentType);
    expect(spyArweaveTransactionsSign).toBeCalledTimes(1);
    expect(spyArweaveTransactionsGetUploader).toBeCalledTimes(1);
    expect(spyTransactionUploaderUploadChunk).toBeCalledTimes(1);
    expect(txId).toBeTruthy();
  });

  describe('ArLocal connection', () => {
    it('should start an ArLocal instance and initialize Arweave on localhost', async () => {
      const useLogging = true;
      const spyArLocalStart = jest.spyOn(ArLocal.prototype, 'start').mockResolvedValueOnce();
      const expectedArweaveInstance = new Arweave({});
      const spyArweaveInit = jest.spyOn(Arweave, 'init').mockReturnValueOnce(expectedArweaveInstance);
      const expectedArweaveInitParams = {
        host: 'localhost',
        port: 1984,
        protocol: 'http',
        logging: useLogging,
      };

      const actualArweaveInstance = await connectToLocalArweave(useLogging);

      expect(spyArLocalStart).toBeCalledTimes(1);
      expect(spyArweaveInit).toBeCalledWith(expectedArweaveInitParams);
      expect(expectedArweaveInstance).toBe(actualArweaveInstance);
    });

    it('should create a new Arweave test wallet and load with money', async () => {
      const arweave = Arweave.init({});
      const spyArweaveApiGet = jest
        .spyOn(arweave.api, 'get')
        .mockImplementation(() => Promise.resolve(mockedAxiosResponseTypeUnknown));

      const key = await generateTestKey(arweave);

      expect(spyArweaveApiGet).toBeCalledWith(expect.stringContaining('mint'));
      expect(key).toBeTruthy();
    });

    it('should get txn URI for arlocal', () => {
      const txn = 'abc123';
      const expectedLocalTxnURI = ARLOCAL_BASE_URL + txn;

      const actualLocalTxnURI = getTxnURI(txn, false);

      expect(expectedLocalTxnURI).toBe(actualLocalTxnURI);
    });

    it('should mint AR tokens to the given key', async () => {
      const arweave = Arweave.init({});
      const winstonsToMint = 1000000;
      const spyArweaveApiGet = jest
        .spyOn(arweave.api, 'get')
        .mockImplementation(() => Promise.resolve(mockedAxiosResponseTypeUnknown));
      const expectedWalletAddress = await arweave.wallets.getAddress(testArweaveKey);

      await mintTestWinstonsToKey(arweave, winstonsToMint, testArweaveKey);

      expect(spyArweaveApiGet).toBeCalledWith(`mint/${expectedWalletAddress}/${winstonsToMint}`);
    });
  });

  describe('real Arweave connection', () => {
    it('should connect to real Arweave', () => {
      const expectedArweaveInstance = new Arweave({});
      const spyArweaveInit = jest.spyOn(Arweave, 'init').mockReturnValueOnce(expectedArweaveInstance);
      const expectedArweaveInitParams = {
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
      };

      const actualArweave = connectToArweave();

      expect(spyArweaveInit).toBeCalledWith(expectedArweaveInitParams);
      expect(expectedArweaveInstance).toBe(actualArweave);
    });

    it('should get txn URI for production', () => {
      const txn = 'abc123';
      const expectedProdTxnURI = ARWEAVE_BASE_URL + txn;

      const actualProdTxnURI = getTxnURI(txn, true);

      expect(expectedProdTxnURI).toBe(actualProdTxnURI);
    });
  });
});

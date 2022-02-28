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
    const spy_axios_get = jest.spyOn(axios, 'get').mockReturnValueOnce(Promise.resolve(axiosReturnValue));

    const result = await getArweavePriceForBytesInWinstons(bytes);

    expect(spy_axios_get).toHaveBeenCalledTimes(1);
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
    const spy_arweave_createTransaction = jest
      .spyOn(arweave, 'createTransaction')
      .mockReturnValueOnce(Promise.resolve(tx));
    const spy_transaction_addTag = jest.spyOn(Transaction.prototype, 'addTag');
    const spy_arweave_transactions_sign = jest
      .spyOn(arweave.transactions, 'sign')
      .mockReturnValueOnce(Promise.resolve());
    const spy_arweave_transactions_getUploader = jest
      .spyOn(arweave.transactions, 'getUploader')
      .mockReturnValueOnce(Promise.resolve(txUploader));
    const spy_transactionUploader_uploadChunk = jest
      .spyOn(TransactionUploader.prototype, 'uploadChunk')
      .mockReturnValue(Promise.resolve());

    const txId = await uploadDataToArweave(arweave, key, data, contentType);

    expect(spy_arweave_createTransaction).toBeCalledTimes(1);
    expect(spy_transaction_addTag).toBeCalledWith('Content-Type', contentType);
    expect(spy_arweave_transactions_sign).toBeCalledTimes(1);
    expect(spy_arweave_transactions_getUploader).toBeCalledTimes(1);
    expect(spy_transactionUploader_uploadChunk).toBeCalledTimes(1);
    expect(txId).toBeTruthy();
  });

  describe('ArLocal connection', () => {
    it('should start an ArLocal instance and initialize Arweave on localhost', async () => {
      const spy_arLocal_start = jest.spyOn(ArLocal.prototype, 'start').mockReturnValueOnce(Promise.resolve());
      const expectedArweaveInstance = new Arweave({});
      const spy_Arweave_init = jest.spyOn(Arweave, 'init').mockReturnValueOnce(expectedArweaveInstance);
      const expectedArweaveInitParams = {
        host: 'localhost',
        port: 1984,
        protocol: 'http',
        logging: true,
      };

      const actualArweaveInstance = await connectToLocalArweave();

      expect(spy_arLocal_start).toBeCalledTimes(1);
      expect(spy_Arweave_init).toBeCalledWith(expectedArweaveInitParams);
      expect(expectedArweaveInstance).toBe(actualArweaveInstance);

    });

    it('should create a new Arweave test wallet and load with money', async () => {
      const arweave = Arweave.init({});
      const spy_arweave_api_get = jest
        .spyOn(arweave.api, 'get')
        .mockImplementation(() => Promise.resolve(mockedAxiosResponseTypeUnknown));

      const key = await generateTestKey(arweave);

      expect(spy_arweave_api_get).toBeCalledWith(expect.stringContaining('mint'));
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
      const spy_arweave_api_get = jest
        .spyOn(arweave.api, 'get')
        .mockImplementation(() => Promise.resolve(mockedAxiosResponseTypeUnknown));
      const expectedWalletAddress = await arweave.wallets.getAddress(testArweaveKey);

      await mintTestWinstonsToKey(arweave, winstonsToMint, testArweaveKey);

      expect(spy_arweave_api_get).toBeCalledWith(`mint/${expectedWalletAddress}/${winstonsToMint}`);
    });
  });

  describe('real Arweave connection', () => {
    it('should connect to real Arweave', () => {
      const expectedArweaveInstance = new Arweave({});
      const spy_Arweave_init = jest.spyOn(Arweave, 'init').mockReturnValueOnce(expectedArweaveInstance);
      const expectedArweaveInitParams = {
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
      };

      const actualArweave = connectToArweave();

      expect(spy_Arweave_init).toBeCalledWith(expectedArweaveInitParams);
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

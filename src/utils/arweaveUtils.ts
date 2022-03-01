import axios from 'axios';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { ARLOCAL_BASE_URL, ARWEAVE_BASE_URL, WINSTONS_PER_AR } from '../constants';

const getArweavePriceForBytesInWinstons = async (bytes: number): Promise<number> => {
  const price = await axios.get<string>(ARWEAVE_BASE_URL + 'price/' + bytes);
  return +price.data;
};

const connectToArweave = (): Arweave => {
  const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https',
    port: 443,
  });
  // tslint:disable-next-line: no-console
  console.log("connected to Arweave mainnet. Careful, you're playing with real money here!");

  return arweave;
};

const connectToLocalArweave = async (useLogging: boolean = true): Promise<Arweave> => {
  const arLocal = new ArLocal();
  await arLocal.start();

  return Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http',
    logging: useLogging,
  });
};

const generateTestKey = async (arweave: Arweave): Promise<JWKInterface> => {
  const key = await arweave.wallets.generate();
  await mintTestWinstonsToKey(arweave, 1000 * WINSTONS_PER_AR, key);
  return key;
};

const uploadDataToArweave = async (
  arweave: Arweave,
  key: JWKInterface,
  data: string | Buffer,
  contentType: string,
): Promise<string> => {
  console.log('========');
  console.log('in uploadDataToArweave');
  
  const tx = await arweave.createTransaction({ data }, key);
  console.log('transaction created');
  
  tx.addTag('Content-Type', contentType);
  console.log('content type added');
  
  await arweave.transactions.sign(tx, key);
  console.log('transaction signed');
  
  const uploader = await arweave.transactions.getUploader(tx);

  while (!uploader.isComplete) {
    console.log('uploading chunk...');
    
    await uploader.uploadChunk();
  }

  console.log('upload complete. Returning ID:');
  console.log('tx.id :>> ', tx.id);
  console.log('========');

  return tx.id;
};

const getTxnURI = (txn: string, isMainnet: boolean): string => {
  if (isMainnet) {
    return ARWEAVE_BASE_URL + txn;
  } else {
    return ARLOCAL_BASE_URL + txn;
  }
};

const mintTestWinstonsToKey = async (arweave: Arweave, numberOfTokens: number, key: JWKInterface): Promise<void> => {
  const walletAddress = await arweave.wallets.getAddress(key);
  await arweave.api.get<number>('mint/' + walletAddress + '/' + numberOfTokens);
  return;
};

export {
  getArweavePriceForBytesInWinstons,
  connectToArweave,
  connectToLocalArweave,
  generateTestKey,
  uploadDataToArweave,
  getTxnURI,
  mintTestWinstonsToKey,
};

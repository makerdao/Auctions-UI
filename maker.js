import Maker from '@makerdao/dai';
import mcdPlugin from '@makerdao/dai-plugin-mcd';
import validatorPlugin from './plugin/index';
import { createCurrency } from '@makerdao/currency';

const mainnetAddresses = require('./contracts/addresses/mainnet.json');
const kovanAddresses = require('./contracts/addresses/kovan.json');
const testchainAddresses = require('./contracts/addresses/testchain.json');

export const SAI = createCurrency('SAI');
export const ETH = Maker.ETH;
export const USD = Maker.USD;
export const MKR = Maker.MKR;

let maker;

export async function instantiateMaker(network) {
  const mcdPluginConfig = {};
  mcdPluginConfig.addressOverrides = mainnetAddresses;
  if (network === 'kovan') {
    mcdPluginConfig.addressOverrides = kovanAddresses;
  }
  if (network === 'testchain') {
    mcdPluginConfig.addressOverrides = testchainAddresses;
    mcdPluginConfig.prefetch = false;
  }

  const config = {
    log: true,
    autoAuthenticate: false,
    plugins: [[mcdPlugin, mcdPluginConfig], validatorPlugin],
    web3: {
      transactionSettings: {
        gasLimit: '150000'
      }
    }
  };

  // Override MKR token with this kovan deployment's address
  if (network === 'kovan') {
    config.token = {
      erc20: [
        {
          currency: MKR,
          symbol: MKR.symbol,
          address: kovanAddresses.MCD_GOV
        }
      ]
    };
  }
  if (network === 'testchain') {
    config.token = {
      erc20: [
        {
          currency: MKR,
          symbol: MKR.symbol,
          address: testchainAddresses.MCD_GOV
        }
      ]
    };
  }

  maker = await Maker.create('browser', config);

  window.maker = maker; // for debugging
  return maker;
}

import Maker from '@makerdao/dai';
import mcdPlugin, { MDAI } from '@makerdao/dai-plugin-mcd';
import validatorPlugin from './plugin/index';
import { createCurrency } from '@makerdao/currency';

const kovanAddresses = require('./contracts/addresses/kovan.json');

export const SAI = createCurrency('SAI');
export const ETH = Maker.ETH;
export const USD = Maker.USD;
export const MKR = Maker.MKR;
export const DAI = MDAI;

let maker;

export async function instantiateMaker(network) {
  const mcdPluginConfig = {};
  if (network === 'kovan') {
    mcdPluginConfig.addressOverrides = kovanAddresses;
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

  maker = await Maker.create('browser', config);
  await maker.authenticate();

  window.maker = maker; // for debugging
  return maker;
}

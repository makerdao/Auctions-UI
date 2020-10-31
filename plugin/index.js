import { map, prop } from 'ramda';

const FLIPPER = 'MCD_FLIP_ETH_A';

import ValidatorService from './ValidatorService';

export default {
  addConfig: function(config, { network = 'mainnet', staging = false }) {
    const contractAddresses = {
      mainnet: require('../contracts/addresses/mainnet.json'),
      kovan: require('../contracts/addresses/kovan.json'),
      testchain: require('../contracts/addresses/testchain.json')
    };

    const addContracts = {
      [FLIPPER]: {
        address: map(prop('MCD_FLIP_ETH_A'), contractAddresses),
        abi: require('../contracts/abis/Flipper.json')
      }
    };

    const makerConfig = {
      ...config,
      additionalServices: ['validator', { network }],
      validator: [ValidatorService],
      smartContract: { addContracts }
    };

    return makerConfig;
  }
};

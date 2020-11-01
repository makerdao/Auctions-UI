import React, { createContext, useState, useEffect } from 'react';
import { getBlockNumber } from '../utils';
import { instantiateMaker } from '../maker';
import useSystemStore from '../stores/systemStore';

export const MakerObjectContext = createContext();

function MakerProvider({ children, network }) {
  const [maker, setMaker] = useState(null);
  const [web3Connected, setWeb3Connected] = useState(null);
  const setBlockHeight = useSystemStore(state => state.setBlockHeight);
  const blockHeight = useSystemStore(state => state.blockHeight);
  const isTestchain = network === 'testchain';

  useEffect(() => {
    if (!network) return;
    instantiateMaker(network).then(maker => {
      setMaker(maker);
    });
  }, [network]);

  useEffect(() => {
    if (maker && web3Connected && process.env.INFURA_KEY) {
      const rpcUrl = isTestchain
        ? 'http://localhost:8545'
        : `https://${network}.infura.io/v3/${process.env.INFURA_KEY}`;

      const interval = setInterval(async () => {
        const _blockHeight = await getBlockNumber(rpcUrl);

        if (_blockHeight !== blockHeight) setBlockHeight(_blockHeight);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [blockHeight, maker, web3Connected]);

  return (
    <MakerObjectContext.Provider
      value={{ maker, network, web3Connected, setWeb3Connected, isTestchain }}
    >
      {children}
    </MakerObjectContext.Provider>
  );
}

export default MakerProvider;

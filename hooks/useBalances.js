import { useEffect, useState } from 'react';
import useMaker from './useMaker';
import { fromRad } from '../pages/index';
import BigNumber from 'bignumber.js';
import { AUCTION_DATA_FETCHER } from '../constants';

const useBalances = () => {
  const { maker, web3Connected } = useMaker();
  const [vatDaiBalance, setVatDaiBalance] = useState(null);
  const [daiBalance, setDaiBalance] = useState(0);
  const [mkrBalance, setMkrBalance] = useState(0);
  const [batBalance, setBatBalance] = useState(0);
  const [flapMkrBalance, setFlapMkrBalance] = useState(0);

  const fetchVatDaiBalance = () => {
    return maker
      .service('smartContract')
      .getContract('MCD_VAT')
      .dai(maker.currentAddress());
  };

  const fetchTokenBalance = token => {
    return maker.getToken(token).balance();
  };

  const fetchFlapMkrBalance = () => {
    const flapAddress = maker.service(AUCTION_DATA_FETCHER).flapAddress;
    return maker.getToken('MKR').balanceOf(flapAddress);
  };

  const fetchBalances = () => {
    return Promise.all([
      fetchVatDaiBalance(),
      fetchTokenBalance('DAI'),
      fetchTokenBalance('MKR'),
      fetchTokenBalance('BAT'),
      fetchFlapMkrBalance()
    ]);
  };

  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const [
        vatBal,
        daiBal,
        mkrBal,
        batBal,
        flapMkrBal
      ] = await fetchBalances();
      setVatDaiBalance(fromRad(vatBal).toFixed());
      setDaiBalance(daiBal.toNumber());
      setMkrBalance(mkrBal.toNumber());
      setBatBalance(batBal.toNumber());
      setFlapMkrBalance(flapMkrBal.toNumber());
    })();
  }, [maker, web3Connected]);

  function joinDaiToAdapter(amount) {
    // amount set in MiniFormLayout is cast a BigNumber
    const joinAmountInDai = maker
      .service('web3')
      ._web3.utils.toWei(amount.toFixed());

    return maker
      .service(AUCTION_DATA_FETCHER)
      .joinDaiToAdapter(
        maker.currentAddress(),
        BigNumber(joinAmountInDai).toFixed()
      );
  }

  async function updateDaiBalances() {
    const [vatBal, daiBal] = await fetchBalances();
    setVatDaiBalance(fromRad(vatBal).toFixed());
    setDaiBalance(daiBal.toNumber());
  }

  function exitDaiFromAdapter(amount) {
    const exitAmountInDai = maker
      .service('web3')
      ._web3.utils.toWei(amount.toFixed());

    return maker
      .service(AUCTION_DATA_FETCHER)
      .exitDaiFromAdapter(
        maker.currentAddress(),
        BigNumber(exitAmountInDai).toFixed()
      );
  }

  return {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    batBalance,
    flapMkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter,
    updateDaiBalances
  };
};

export default useBalances;

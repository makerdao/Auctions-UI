import { useEffect, useState } from 'react';
import useMaker from './useMaker';
import {
  AUCTION_DATA_FETCHER,
  MCD_FLIP_BAT_A,
  MCD_JOIN_DAI,
  MCD_FLIP_ETH_A,
  MCD_FLOP,
  FLIP_ENABLED_ILKS
} from '../constants';

const REQUIRED_ALLOWANCE = 0;

const useAllowances = () => {
  const { maker, web3Connected } = useMaker();
  const [hasDaiAllowance, setHasDaiAllowance] = useState(false);
  const [hasMkrAllowance, setHasMkrAllowance] = useState(false);
  const [hasHope, setHasHope] = useState({});

  // DAI Allowance
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const joinDaiAdapterAddress = maker.service(AUCTION_DATA_FETCHER)
        .joinDaiAdapterAddress;
      const daiAllowance = await maker
        .getToken('DAI')
        .allowance(maker.currentAddress(), joinDaiAdapterAddress);
      setHasDaiAllowance(daiAllowance.gt(REQUIRED_ALLOWANCE) ? true : false);
    })();
  }, [maker, web3Connected]);

  // MKR Allowance
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const joinDaiAdapterAddress = maker.service(AUCTION_DATA_FETCHER)
        .joinDaiAdapterAddress;
      const mkrAllowance = await maker
        .getToken('DAI')
        .allowance(maker.currentAddress(), joinDaiAdapterAddress);
      setHasMkrAllowance(mkrAllowance.gt(REQUIRED_ALLOWANCE) ? true : false);
    })();
  }, [maker, web3Connected]);

  const fetchFlipIlkHope = async ilk => {
    const address = maker.service(AUCTION_DATA_FETCHER).getFlipAdapter(ilk)
      .address;

    const can = await maker
      .service('smartContract')
      .getContract('MCD_VAT')
      .can(maker.currentAddress(), address);

    setHasHope(state => ({
      ...state,
      [`MCD_FLIP_${ilk.replace('-', '_')}`]: can.toNumber() === 1
    }));
  };

  const fetchFlipHopes = () => {
    return Promise.all(FLIP_ENABLED_ILKS.map(ilk => fetchFlipIlkHope(ilk)));
  };

  // Ilk Hopes
  useEffect(() => {
    if (!web3Connected) return;
    (async () => await fetchFlipHopes())();
  }, [maker, web3Connected]);

  // Flip ETH has Hope
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const flipEthAddress = maker.service(AUCTION_DATA_FETCHER).flipEthAddress;
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(maker.currentAddress(), flipEthAddress);
      setHasHope(state => ({
        ...state,
        [MCD_FLIP_ETH_A]: can.toNumber() === 1
      }));
    })();
  }, [maker, web3Connected]);

  // Flip BAT has Hope
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const flipBatAddress = maker.service(AUCTION_DATA_FETCHER).flipBatAddress;
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(maker.currentAddress(), flipBatAddress);
      setHasHope(state => ({
        ...state,
        [MCD_FLIP_BAT_A]: can.toNumber() === 1
      }));
    })();
  }, [maker, web3Connected]);

  // Join DAI has Hope
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const joinDaiAdapterAddress = maker.service(AUCTION_DATA_FETCHER)
        .joinDaiAdapterAddress;
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(maker.currentAddress(), joinDaiAdapterAddress);
      setHasHope(state => ({
        ...state,
        [MCD_JOIN_DAI]: can.toNumber() === 1
      }));
    })();
  }, [maker, web3Connected]);

  // Flop has Hope
  useEffect(() => {
    if (!web3Connected) return;
    (async () => {
      const flopAddress = maker.service(AUCTION_DATA_FETCHER).flopAddress;
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(maker.currentAddress(), flopAddress);
      setHasHope(state => ({
        ...state,
        [MCD_FLOP]: can.toNumber() === 1
      }));
    })();
  }, [maker, web3Connected]);

  const giveDaiAllowance = async address => {
    try {
      await maker.getToken('DAI').approveUnlimited(address);
      setHasDaiAllowance(true);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock dai tx failed ${message}`;
      console.error(errMsg);
    }
  };

  const giveMkrAllowance = async address => {
    try {
      await maker.getToken('MKR').approveUnlimited(address);
      setHasMkrAllowance(true);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock mkr tx failed ${message}`;
      console.error(errMsg);
    }
  };

  // Give contract hope
  const giveHope = async (address, name) => {
    try {
      await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .hope(address);
      setHasHope({ ...hasHope, [name]: true });
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `hope tx failed ${message}`;
      console.error(errMsg);
    }
  };

  return {
    hasDaiAllowance,
    hasMkrAllowance,
    giveDaiAllowance,
    giveMkrAllowance,
    giveHope,
    hasHope
  };
};

export default useAllowances;

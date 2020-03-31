import useMaker from './useMaker';
import { AUCTION_DATA_FETCHER } from '../constants';

const useAuctionActions = () => {
  const { maker, web3Connected } = useMaker();

  function callTend(auctionId, lotSize, bidAmount, type) {
    try {
      const methods = {
        'ETH-A': 'flipEthTend',
        'BAT-A': 'flipBatTend'
      };
      return maker
        .service(AUCTION_DATA_FETCHER)[methods[type]](auctionId, lotSize, bidAmount.toNumber());
    } catch (err) {
      window.alert(err);
    }
  }

  //ETH dent
  async function callEthDent(auctionId, lotSize, bidAmount) {
    try {
      const tend = await maker
        .service(AUCTION_DATA_FETCHER)
        .flipEthDent(auctionId, lotSize.toNumber(), bidAmount);
    } catch (err) {
      window.alert(err);
    }
  }

  function callFlopDent(auctionId, lotSize, bidAmount) {
    try {
      return maker
        .service(AUCTION_DATA_FETCHER)
        .flopDent(auctionId, lotSize, bidAmount);
    } catch (err) {
      window.alert(err);
    }
  }

  function callFlopDeal(auctionId) {
    try {
      return maker.service(AUCTION_DATA_FETCHER).flopDeal(auctionId);
    } catch (err) {
      window.alert(err);
    }
  }

  return {
    callTend,
    callFlopDent,
    callFlopDeal,
    callEthDent
  };
};

export default useAuctionActions;

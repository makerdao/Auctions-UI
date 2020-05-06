import { PublicService } from '@makerdao/services-core';
import tracksTransactions from './tracksTransactions';
import BigNumber from 'bignumber.js';
import { toRad, fromWei, toWei, fromWad } from './utils';
import * as gqlQueries from '../queries';
import { CUT_OFF_PERIOD } from '../constants';

/**
 *  
 *    id
      type
      ilk
      hash
      fromAddress
      amount
      payAmount
      minPayAmount
      maxPayAmount
      dgem
      ddai
      auctionId
      lot
      bid
      ink
      tab
      timestamp
      price
 */

const mocks = [
  {
    id: 101,
    type: 'type',
    ilk: 'ilk',
    hash: '0x02e0632d67da2cb319e366ecd7500b9f463095888879d97a646435526343fa29',
    fromAddress: '0x9ee5e175d09895b8e1e28c22b961345e1df4b5ae',
    amount: 'amount',
    payAmount: 'payamount',
    minPayAmount: 'minpayamount',
    maxPayAmount: 'maxpayamount',
    dgem: 'dgem',
    ddai: 'ddai',
    auctionId: '1',
    lot: 'lot',
    bid: 'bid',
    ink: 'ink',
    tab: 'tab',
    timestamp: 1588338005,
    price: 'price'
  },
  {
    id: 102,
    type: 'type2',
    ilk: 'ilk2',
    hash: '0x02e0632d67da2cb319e366ecd7500b9f463095888879d97a646435526343fa29',
    fromAddress: '0x9ee5e175d09895b8e1e28c22b961345e1df4b5ae',
    amount: 'amount2',
    payAmount: 'payamount2',
    minPayAmount: 'minpayamount2',
    maxPayAmount: 'maxpayamount2',
    dgem: 'dgem2',
    ddai: 'ddai2',
    auctionId: '2',
    lot: 'lot2',
    bid: 'bid2',
    ink: 'ink2',
    tab: 'tab2',
    timestamp: 'timestamp2',
    price: 'price2'
  }
];

export default class ValidatorService extends PublicService {
  flipAuctionsLastSynced = 0;
  flopAuctionsLastSynced = 0;
  backInTime = CUT_OFF_PERIOD;

  constructor(name = 'validator') {
    super(name, ['web3', 'smartContract']);
    this.queryPromises = {};
    this.staging = false;

    this.id = 123;
  }

  async getQueryResponse(serverUrl, query, operationName, variables = {}) {
    console.log('1. getQueryResponse', query);
    const resp = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables,
        operationName
      })
    });
    const { data } = await resp.json();
    return data;
  }

  async getQueryResponseMemoized(serverUrl, query) {
    console.log('getQueryResponseMemoized', query);
    let cacheKey = `${serverUrl};${query}`;
    if (this.queryPromises[cacheKey]) return this.queryPromises[cacheKey];
    this.queryPromises[cacheKey] = this.getQueryResponse(serverUrl, query);
    return this.queryPromises[cacheKey];
  }

  async fetchFlipAuctions(shouldSync = false) {
    let currentTime = new Date().getTime();
    const timePassed = currentTime - this.flipAuctionsLastSynced;
    let queryDate = new Date();

    if (shouldSync) {
      queryDate = new Date(currentTime - timePassed);
    } else {
      queryDate = new Date(currentTime - this.backInTime);
    }

    this.flipAuctionsLastSynced = currentTime;

    return this.getAllAuctions({
      sources: [this.flipEthAddress, this.flipBatAddress],
      fromDate: queryDate
    });
  }

  async fetchFlopAuctions(shouldSync = false) {
    let currentTime = new Date().getTime();
    const timePassed = currentTime - this.flopAuctionsLastSynced;
    let queryDate = new Date();

    if (shouldSync) {
      queryDate = new Date(currentTime - timePassed);
    } else {
      queryDate = new Date(currentTime - this.backInTime);
    }

    this.flopAuctionsLastSynced = currentTime;
    return this.getAllAuctions({
      sources: [this.flopAddress],
      fromDate: queryDate
    });
  }

  async fetchFlopAuctionsByIds(ids) {
    console.log('fetchFlopAuctionsByIds', ids);
    let currentTime = new Date().getTime();
    const queryDate = new Date(currentTime - this.backInTime);

    const variables = {
      sources: [this.flopAddress],
      auctionIds: ids,
      fromDate: queryDate
    };

    // console.log('mocks.some(ids)', mocks.some(ids));
    const filt = mocks.filter(x => ids.includes(x.auctionId));
    console.log('mocks.filter', filt);
    return filt;

    // const response = await this.getQueryResponse(
    //   this._cacheAPI,
    //   gqlQueries.specificAuctionEvents,
    //   'setAuctionsEvents',
    //   variables
    // );

    // // console.log('GraphQL response', response);
    // return response.allLeveragedEvents.nodes;
  }

  async getAllAuctions(variables) {
    console.log('1- getAllAuctions', variables);
    // const response = await this.getQueryResponse(
    //   this._cacheAPI,
    //   gqlQueries.allAuctionEvents,
    //   'allAuctionsEvents',
    //   variables
    // );
    // console.log('GraphQL response', response);
    // return response.allLeveragedEvents.nodes;
    return mocks;
  }

  connect() {
    this._cacheAPI =
      this.get('web3').networkName === 'kovan'
        ? 'https://kovan-auctions.oasis.app/api/v1'
        : 'https://auctions.oasis.app/api/v1';
  }

  async getLots(id) {
    const bids = await this._flipEthAdapter().bids(id);
    const lotSize = bids[0];
    return lotSize;
  }

  async flipEthTend(id, size, amount) {
    const lotSizeInWei = this.get('web3')._web3.utils.toWei(size.toString());
    const bidAmountRad = toRad(amount);

    const tend = await this._flipEthAdapter().tend(
      id,
      lotSizeInWei,
      bidAmountRad.toFixed()
    );
  }

  async flipEthDent(id, size, amount) {
    const lotSizeInWei = this.get('web3')._web3.utils.toWei(size.toString());
    const bidAmountRad = toRad(amount);

    const dent = await this._flipEthAdapter().dent(
      id,
      lotSizeInWei,
      bidAmountRad.toFixed()
    );
  }

  async flipEthDeal(id) {
    const deal = await this._flipEthAdapter().deal(id);
  }

  async flipBatDeal(id) {
    const deal = await this._flipBatAdapter().deal(id);
  }

  // FLOP
  @tracksTransactions
  async flopDent(id, lotSize, bidAmount, { promise }) {
    const lotSizeInWei = toWei(lotSize).toFixed();
    const bidAmountRad = toRad(bidAmount).toFixed();

    return this._flop().dent(id, lotSizeInWei, bidAmountRad, { promise });
  }

  @tracksTransactions
  async flopDeal(id, { promise }) {
    return this._flop().deal(id, { promise });
  }

  async getAuction(id) {
    console.log('fetching', id);
    try {
      return await this._flipEthAdapter().bids(id);
    } catch (err) {}
  }

  async getFlopDuration(id) {
    try {
      // const flop = await this._flop().bids(id);
      return { end: BigNumber(0), tic: BigNumber(0) };
      return {
        end: new BigNumber(flop.end).times(1000),
        tic: flop.tic ? new BigNumber(flop.tic).times(1000) : new BigNumber(0)
      };
    } catch (err) {}
  }

  async getFlipDuration(id) {
    try {
      const flip = await this._flipEthAdapter().bids(id);
      return {
        end: new BigNumber(flip.end).times(1000),
        tic: flip.tic ? new BigNumber(flip.tic).times(1000) : new BigNumber(0)
      };
    } catch (err) {}
  }

  async getFlopStepSize() {
    const beg = await this._flop().beg();
    return fromWad(beg);
  }

  @tracksTransactions
  async joinDaiToAdapter(address, amount, { promise }) {
    await this._joinDaiAdapter().join(address, amount, { promise });
  }

  @tracksTransactions
  async exitDaiFromAdapter(address, amount, { promise }) {
    await this._joinDaiAdapter().exit(address, amount, { promise });
  }

  get flipEthAddress() {
    return this._flipEthAdapter().address;
  }

  get flipBatAddress() {
    return this._flipBatAdapter().address;
  }

  get flopAddress() {
    return this._flop().address;
  }

  get joinDaiAdapterAddress() {
    return this._joinDaiAdapter().address;
  }

  _flipEthAdapter() {
    return this.get('smartContract').getContractByName('MCD_FLIP_ETH_A');
  }

  _flipBatAdapter() {
    return this.get('smartContract').getContractByName('MCD_FLIP_BAT_A');
  }

  _flop() {
    return this.get('smartContract').getContractByName('MCD_FLOP');
  }

  _joinDaiAdapter() {
    return this.get('smartContract').getContractByName('MCD_JOIN_DAI');
  }
}

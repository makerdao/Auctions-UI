import { PublicService } from '@makerdao/services-core';
import tracksTransactions from './tracksTransactions';
import BigNumber from 'bignumber.js';
import { toRad, fromWei, toWei, fromWad } from './utils';
import * as gqlQueries from '../queries';
import { CUT_OFF_PERIOD } from '../constants';
import mockResponse from './mockFlapResponse.json';

export default class ValidatorService extends PublicService {
  flipAuctionsLastSynced = 0;
  flopAuctionsLastSynced = 0;
  flapAuctionsLastSynced = 0;
  backInTime = CUT_OFF_PERIOD;

  constructor(name = 'validator') {
    super(name, ['web3', 'smartContract']);
    this.queryPromises = {};
    this.staging = false;

    this.id = 123;
  }

  connect() {
    this._cacheAPI =
      this.get('web3').networkName === 'kovan'
        ? 'https://kovan-auctions.oasis.app/api/v1'
        : 'https://auctions.oasis.app/api/v1';
    this._flapApi = 'http://localhost:7777/api/flaps';
  }

  async getQueryResponse(serverUrl, query, operationName, variables = {}) {
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
    let cacheKey = `${serverUrl};${query}`;
    if (this.queryPromises[cacheKey]) return this.queryPromises[cacheKey];
    this.queryPromises[cacheKey] = this.getQueryResponse(serverUrl, query);
    return this.queryPromises[cacheKey];
  }

  async getApiResponse(url) {
    let data = [];
    try {
      const resp = await fetch(url);
      data = await resp.json();
    } catch (e) {
      console.error(e);
    }
    return data;
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

  async fetchFlipAuctionsByIds(ids) {
    let currentTime = new Date().getTime();
    const queryDate = new Date(currentTime - this.backInTime);

    const variables = {
      sources: [this.flipEthAddress, this.flipBatAddress],
      auctionIds: ids,
      fromDate: queryDate
    };

    const response = await this.getQueryResponse(
      this._cacheAPI,
      gqlQueries.specificAuctionEvents,
      'setAuctionsEvents',
      variables
    );

    return response.allLeveragedEvents.nodes;
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
    let currentTime = new Date().getTime();
    const queryDate = new Date(currentTime - this.backInTime);

    const variables = {
      sources: [this.flopAddress],
      auctionIds: ids,
      fromDate: queryDate
    };

    const response = await this.getQueryResponse(
      this._cacheAPI,
      gqlQueries.specificAuctionEvents,
      'setAuctionsEvents',
      variables
    );

    // console.log('GraphQL response', response);
    return response.allLeveragedEvents.nodes;
  }

  async fetchFlapAuctions() {
    const url = `${this._flapApi}/events?daysAgo=15`;
    const data = await this.getApiResponse(url);
    return data;
  }

  async fetchFlapAuctionsById(id) {
    const url = `${this._flapApi}/${id}`;
    const data = await this.getApiResponse(url);
    return data;
  }

  async fetchFlapAuctionsByIds(ids) {
    // TODO fix this array issue lower down the stack:
    const [auctions] = await Promise.all(
      ids.map(id => this.fetchFlapAuctionsById(id))
    );
    return auctions;
  }

  async getAllAuctions(variables) {
    const response = await this.getQueryResponse(
      this._cacheAPI,
      gqlQueries.allAuctionEvents,
      'allAuctionsEvents',
      variables
    );
    // console.log('GraphQL response', response);
    return response.allLeveragedEvents.nodes;
  }

  async getLots(id) {
    const bids = await this._flipEthAdapter().bids(id);
    const lotSize = bids[0];
    return lotSize;
  }

  @tracksTransactions
  async flipEthTend(id, size, amount, { promise }) {
    const lotSizeInWei = this.get('web3')._web3.utils.toWei(size.toString());
    const bidAmountRad = toRad(amount);

    return this._flipEthAdapter().tend(
      id,
      lotSizeInWei,
      bidAmountRad.toFixed(),
      { promise }
    );
  }

  @tracksTransactions
  async flipBatTend(id, size, amount, { promise }) {
    const lotSizeInWei = this.get('web3')._web3.utils.toWei(size.toString());
    const bidAmountRad = toRad(amount);

    return this._flipBatAdapter().tend(
      id,
      lotSizeInWei,
      bidAmountRad.toFixed(),
      { promise }
    );
  }

  @tracksTransactions
  async flipTend(id, size, amount, ilk, { promise }) {
    const lotSizeInWei = this.get('web3')._web3.utils.toWei(size.toString());
    const bidAmountRad = toRad(amount);

    return this.getFlipAdapter(ilk).tend(
      id,
      lotSizeInWei,
      bidAmountRad.toFixed(),
      {
        promise
      }
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

  // FLAP
  @tracksTransactions
  async flapTend(id, lotSize, bidAmount, { promise }) {
    const lotSizeInWei = toRad(lotSize).toFixed();
    const bidAmountRad = toWei(bidAmount).toString();

    const result = this._flap().tend(id, lotSizeInWei, bidAmountRad, {
      promise
    });
    return result;
  }

  @tracksTransactions
  async flapDeal(id, { promise }) {
    return this._flap().deal(id, { promise });
  }

  async getAuction(id) {
    try {
      return await this._flipEthAdapter().bids(id);
    } catch (err) {}
  }

  async getAuctionDuration(id, type, ilk) {
    try {
      const bid =
        type === 'flip'
          ? await this._flipIlkAdapter(ilk).bids(id)
          : type === 'flap'
          ? await this._flap().bids(id)
          : await this._flop().bids(id);
      return {
        end: new BigNumber(bid.end).times(1000),
        tic: bid.tic ? new BigNumber(bid.tic).times(1000) : new BigNumber(0)
      };
    } catch (err) {
      console.error(err);
    }
  }

  async getFlopStepSize() {
    const beg = await this._flop().beg();
    return fromWad(beg);
  }

  async getFlapStepSize() {
    const beg = await this._flap().beg();
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

  get flapAddress() {
    return this._flap().address;
  }

  get joinDaiAdapterAddress() {
    return this._joinDaiAdapter().address;
  }

  getFlipAdapter(ilk) {
    const suffix = ilk.replace('-', '_');
    return this.get('smartContract').getContractByName(`MCD_FLIP_${suffix}`);
  }

  _flipIlkAdapter(ilk) {
    return {
      'ETH-A': this._flipEthAdapter(),
      'BAT-A': this._flipBatAdapter()
    }[ilk];
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

  _flap() {
    return this.get('smartContract').getContractByName('MCD_FLAP');
  }

  _joinDaiAdapter() {
    return this.get('smartContract').getContractByName('MCD_JOIN_DAI');
  }
}

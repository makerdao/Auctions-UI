import create from 'zustand';
import BigNumber from 'bignumber.js';
import { AUCTION_DATA_FETCHER } from '../constants';

const initialPageState = { pageStart: 0, pageEnd: 10, pageStep: 10 };

const transformEvents = async (auctions, service, type, ilk) => {
  const groupedEvents = _.groupBy(auctions, auction => auction.auctionId);
  let auctionsData = {};
  console.log('fetched events');
  await Promise.all(
    Object.keys(groupedEvents).map(async id => {
      try {
        const { end, tic } = await service.getAuctionDuration(id, type, ilk);
        auctionsData[id.toString()] = {
          auctionId: id,
          end,
          tic,
          events: groupedEvents[id]
        };
      } catch (error) {
        console.log('failed to load onchain data, please refresh.', error);
      }
    })
  );

  return auctionsData;
};

const transformFlapEvents = async (auctions, service, type, ilk) => {
  const groupedEvents = _.groupBy(auctions, auction => auction.auctionId);
  let auctionsData = {};
  await Promise.all(
    Object.keys(groupedEvents).map(async id => {
      try {
        const { end, tic } = await service.getAuctionDuration(id, type, ilk);
        auctionsData[id.toString()] = {
          auctionId: id,
          end,
          tic,
          events: groupedEvents[id]
        };
      } catch (error) {
        console.log('failed to load onchain data, please refresh.', error);
      }
    })
  );

  return auctionsData;
};

const includeAuctionsWithFullHistoryOnly = auctions => {
  const filteredAuctions = {};
  Object.keys(auctions).map(auctionId => {
    const hasKick = auctions[auctionId].events.find(
      event => event.type === 'Kick'
    );
    if (hasKick) {
      filteredAuctions[auctionId.toString()] = auctions[auctionId];
    }
  });
  return filteredAuctions;
};

const filters = {
  byPage: (state, ids) => {
    const { pageStart, pageEnd } = state;

    return ids.slice(pageStart, pageEnd);
  },

  byId: (ids, id) => {
    return ids.filter(auctionId => (id ? auctionId === id : auctionId));
  },
  byBidderAddr: (ids, value, auctions) => {
    const filteredIds = ids.reduce((p, n) => {
      const auction = auctions[n];
      if (!auction) return p;

      const hasEventWithBidder = !!auction.events.find(
        ({ fromAddress }) =>
          fromAddress &&
          value &&
          fromAddress.toLowerCase() === value.toLowerCase()
      );

      if (hasEventWithBidder) {
        return [n, ...p];
      } else {
        return p;
      }
    }, []);

    return filteredIds;
  },
  byNotCompleted: (ids, auctions) => {
    const filteredIds = ids
      .map(id => {
        const auction = auctions[id];
        if (!auction) return false;
        const hasDeal = auction.events.find(e => e.type === 'Deal');
        if (!hasDeal) return id;
        return false;
      })
      .filter(Boolean);
    return filteredIds;
  }
};

function sortByBidPrice(auctions, asc) {
  return Object.keys(auctions || [])
    .map(auctionId => {
      return auctions[auctionId].events.find(event => event.type !== 'Deal');
    })
    .map(event => {
      const bid = new BigNumber(event.bid);
      const lot = new BigNumber(event.lot);
      const bidPrice = lot.eq(new BigNumber(0)) ? lot : bid.div(lot);
      return {
        bidPrice,
        auctionId: event.auctionId
      };
    })
    .sort((prev, next) => {
      if (next.bidPrice.gt(prev.bidPrice)) return asc ? -1 : 1;
      if (next.bidPrice.lt(prev.bidPrice)) return asc ? 1 : -1;
      return 0;
    })
    .map(event => {
      return event.auctionId;
    });
}

function sortByTime(auctions, asc) {
  return Object.keys(auctions || []).sort((prevId, nextId) => {
    const now = new Date().getTime();

    const prev = auctions[prevId];
    const next = auctions[nextId];

    const prevTicEndMin = prev.tic.lt(prev.end) ? prev.tic : prev.end;
    const prevEndTime = prev.tic.eq(0) ? prev.end : prevTicEndMin;
    const prevTimeRemaining = prevEndTime.lte(now)
      ? new BigNumber(0)
      : prevEndTime.minus(now);

    const nextTicEndMin = next.tic.lt(next.end) ? next.tic : next.end;
    const nextEndTime = next.tic.eq(0) ? next.end : nextTicEndMin;
    const nextTimeRemaining = nextEndTime.lte(now)
      ? new BigNumber(0)
      : nextEndTime.minus(now);

    if (prevTimeRemaining.eq(0) || nextTimeRemaining.eq(0)) return asc ? -1 : 0;
    if (prevTimeRemaining.eq(nextTimeRemaining)) return 0;
    else if (prevTimeRemaining.lt(nextTimeRemaining)) return asc ? -1 : 1;
    else return asc ? 1 : -1;
  });
}

const sorters = {
  byLatestAsc: auctions => Object.keys(auctions || []),
  byLatestDesc: auctions => Object.keys(auctions || []).reverse(),

  byBidPriceAsc: auctions => sortByBidPrice(auctions, true),
  byBidPriceDesc: auctions => sortByBidPrice(auctions, false),

  byTimeAsc: auctions => sortByTime(auctions, true),
  byTimeDesc: auctions => sortByTime(auctions, false)
};

const selectors = {
  hasPrevPageSelector: () => state => {
    const { pageStep, pageStart } = state;
    return pageStart - pageStep >= 0;
  },

  hasNextPageSelector: auctions => state => {
    const { pageEnd } = state;
    return pageEnd - (auctions || []).length < 0;
  },

  filteredAuctions: type => state => {
    const {
      filterByIdValue,
      auctions: flopAuctions,
      flipAuctions,
      flapAuctions,
      sortBy,
      filterByBidderValue,
      filterByNotCompleted
    } = state;
    const auctions =
      type === 'flip'
        ? flipAuctions
        : type === 'flap'
        ? flapAuctions
        : flopAuctions;
    if (!auctions) return null;
    let ids = sorters[sortBy](auctions);

    if (filterByBidderValue) {
      ids = filters.byBidderAddr(ids, filterByBidderValue, auctions);
    }

    ids = filters.byId(ids, filterByIdValue);

    if (filterByNotCompleted) {
      ids = filters.byNotCompleted(ids, auctions);
    }
    return ids.map(id => auctions[id]);
  },

  auctionsPage: auctions => state => {
    if (!auctions) return null;
    return filters.byPage(state, auctions);
  }
};

const [useAuctionsStore, updateState] = create((set, get) => ({
  auctions: null,
  flipAuctions: null,
  flapAuctions: null,
  flopStepSize: 0,
  flapStepSize: 0,
  pageStart: 0,
  pageEnd: 10,
  pageStep: 10,
  sortBy: 'byLatestDesc',
  filterByIdValue: '',
  filterByBidderBalue: '',
  filterByComplete: false,
  filterByCurrentBidder: false,
  filterByNotCompleted: false,

  nextPage: () => {
    const { pageStart, pageEnd, pageStep } = get();

    set({
      pageStart: pageStart + pageStep,
      pageEnd: pageEnd + pageStep
    });
  },

  prevPage: () => {
    const { pageStart, pageEnd, pageStep } = get();

    set({
      pageStart: pageStart - pageStep,
      pageEnd: pageEnd - pageStep
    });
  },

  setSortBy: sortBy => {
    set({ sortBy, ...initialPageState });
  },

  setFilterByIdValue: val => {
    set({
      filterByIdValue: val,
      ...initialPageState
    });
  },
  setFilterByBidderValue: val => {
    set({
      filterByBidderValue: val,
      filterByCurrentBidder: false,
      ...initialPageState
    });
  },

  toggleFilterByCurrentBidder: val => {
    const { filterByCurrentBidder } = get();

    set({
      filterByBidderValue: filterByCurrentBidder ? '' : val,
      filterByCurrentBidder: !filterByCurrentBidder,
      ...initialPageState
    });
  },

  toggleFilterByNotCompleted: () => {
    const { filterByNotCompleted } = get();

    set({
      filterByNotCompleted: !filterByNotCompleted,
      ...initialPageState
    });
  },

  fetchAll: async maker => {
    const service = maker.service(AUCTION_DATA_FETCHER);
    const auctions = await service.fetchFlopAuctions();
    const transformedAuctions = await transformEvents(auctions, service);
    set({ auctions: includeAuctionsWithFullHistoryOnly(transformedAuctions) });
  },

  fetchSet: async ids => {
    setTimeout(async () => {
      console.log('fetching set: ', ids);
      const service = maker.service(AUCTION_DATA_FETCHER);
      const auctions = await service.fetchFlopAuctionsByIds(ids);
      const transformedAuctions = await transformEvents(auctions, service);

      const currentState = get().auctions || {};
      const updatedState = Object.assign({}, currentState, transformedAuctions);
      set({ auctions: updatedState });
    }, 500);
  },

  fetchAllFlip: async (maker, ilk) => {
    const service = maker.service(AUCTION_DATA_FETCHER);

    // AuctionIDs will clash unless we filter by ilk
    const auctions = (await service.fetchFlipAuctions()).filter(
      x => x.ilk === ilk
    );
    const transformedAuctions = await transformEvents(
      auctions,
      service,
      'flip',
      ilk
    );
    set({ flipAuctions: transformedAuctions });
  },

  fetchFlipSet: async (ids, ilk) => {
    setTimeout(async () => {
      console.log('fetching set: ', ids);
      const service = maker.service(AUCTION_DATA_FETCHER);
      const auctions = (await service.fetchFlipAuctionsByIds(ids)).filter(
        x => x.ilk === ilk
      );
      const transformedAuctions = await transformEvents(
        auctions,
        service,
        'flip',
        ilk
      );

      const currentState = get().flipAuctions || {};
      const updatedState = Object.assign({}, currentState, transformedAuctions);
      set({ flipAuctions: updatedState });
    }, 500);
  },

  fetchAllFlap: async maker => {
    const service = maker.service(AUCTION_DATA_FETCHER);
    const auctions = await service.fetchFlapAuctions();
    const transformedAuctions = await transformFlapEvents(
      auctions,
      service,
      'flap'
    );
    set({
      flapAuctions: includeAuctionsWithFullHistoryOnly(transformedAuctions)
    });
  },

  fetchFlapSet: async ids => {
    setTimeout(async () => {
      console.log('fetching set: ', ids);
      const service = maker.service(AUCTION_DATA_FETCHER);
      const auctions = await service.fetchFlapAuctionsByIds(ids);
      const transformedAuctions = await transformFlapEvents(
        auctions,
        service,
        'flap'
      );

      const currentState = get().auctions || {};
      const updatedState = Object.assign({}, currentState, transformedAuctions);
      set({ flapAuctions: updatedState });
    }, 500);
  },

  fetchFlopStepSize: async maker => {
    const service = maker.service(AUCTION_DATA_FETCHER);
    set({ flopStepSize: await service.getFlopStepSize() });
  },

  fetchFlapStepSize: async maker => {
    const service = maker.service(AUCTION_DATA_FETCHER);
    set({ flapStepSize: await service.getFlapStepSize() });
  }
}));

export default useAuctionsStore;
export { filters, selectors, updateState };

import BigNumber from 'bignumber.js';

export const AUCTION_DATA_FETCHER = 'validator'; //TODO update this when we change the name

// possible auction statuses --------
export const IN_PROGRESS = 'inprogress';
export const COMPLETED = 'completed';
export const CAN_BE_DEALT = 'canbedealt';
export const CAN_BE_RESTARTED = 'canberestarted';

// transaction states --------
export const TX_PENDING = 'pending';
export const TX_SUCCESS = 'success';
export const TX_ERROR = 'error';

// user bid status -------
export const TOP_BIDDER='bidder';
export const WINNER = 'winner';

export const REFETCH_BLOCK_INTERVAL = 5;

export const balanceRounding = {
  zeroToOne: 6,
  oneTo10K: 2,
  over10K: 0
};

// Numbers
export const ZERO = new BigNumber(0);

// How many hours back in time we should look for events 
export const CUT_OFF_PERIOD = 1000 * 60 * 60 * 360; // 360 hours -> 15 days

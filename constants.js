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
export const TOP_BIDDER = 'bidder';
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

// Contract names
export const MCD_FLIP_ETH_A = 'MCD_FLIP_ETH_A';
export const MCD_FLIP_BAT_A = 'MCD_FLIP_BAT_A';
export const MCD_JOIN_DAI = 'MCD_JOIN_DAI';
export const MCD_FLOP = 'MCD_FLOP';
export const MCD_FLAP = 'MCD_FLAP';

export const FLIP_ENABLED_ILKS = [
  'ETH-A',
  'ETH-B',
  'BAT-A',
  'USDC-A',
  'USDC-B',
  'WBTC-A',
  'KNC-A',
  'ZRX-A',
  'MANA-A',
  'USDT-A',
  'PAXUSD-A'
];

/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import { Text, jsx, Grid, Box, Flex, Link as SLink } from 'theme-ui';
import BigNumber from 'bignumber.js';
import Moment from 'react-moment';
import { etherscanLink, formatAddress } from '../utils';
import MiniFormLayout from './MiniFormLayout';
import useAuctionActions from '../hooks/useAuctionActions';
import ActionTabs from './ActionTabs';
import AuctionBlockLayout from './AuctionBlockLayout';
import {
  IN_PROGRESS,
  COMPLETED,
  CAN_BE_DEALT,
  CAN_BE_RESTARTED,
  WINNER,
  TOP_BIDDER,
  MCD_JOIN_DAI
} from '../constants';
import useAuctionsStore, { selectors } from '../stores/auctionsStore';
import InfoPill from './InfoPill';
import { TX_SUCCESS, AUCTION_DATA_FETCHER } from '../constants';
import ReactGA from 'react-ga';

const UserBidStatusPills = {
  [TOP_BIDDER]: (
    <InfoPill bg="noticeAlt" color="onNotice">
      Current Winning Bidder
    </InfoPill>
  ),
  [WINNER]: (
    <InfoPill bg="successAlt" color="onSuccess">
      You have won this auction
    </InfoPill>
  )
};

const AuctionEvent = ({ type, lot, bid, mkrPrice, timestamp, tx, sender }) => {
  const { maker, network } = useMaker();

  const fields = [
    ['Event Type', type],
    ['Bid Amount', bid],
    ['Lot Size', `${lot} DAI`, { color: 'primary' }],
    ['MKR Price', mkrPrice, { fontWeight: 600 }],
    ['Timestamp', timestamp],

    [
      'Sender',
      <SLink href={etherscanLink(sender, network)} target="_blank">
        {formatAddress(sender)}
      </SLink>,
      {
        fontWeight: maker.currentAddress() === sender ? 500 : 400
      }
    ],
    [
      'Tx',
      <SLink href={etherscanLink(tx, network)} target="_blank">
        {formatAddress(tx)}
      </SLink>
    ]
  ];
  return (
    <Grid
      gap={2}
      columns={[2, 3, 4]}
      sx={{
        bg: 'background',
        p: 3,
        borderRadius: 'medium'
      }}
    >
      {fields.map(([title, value, styling]) => {
        return (
          <Box key={title}>
            <Text
              variant="caps"
              sx={{
                fontSize: 0,
                mb: 2
              }}
            >
              {title}
            </Text>
            <Text
              sx={{
                fontSize: 1,
                ...styling
              }}
            >
              {value}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
};

const OrderSummary = ({
  currentBid,
  minMkrAsk,
  calculatedBidPrice,
  hasSlippage
}) => {
  const fields = [
    ['Min bid amount', minMkrAsk, { fontWeight: 600 }],
    ['Requested bid amount', currentBid, { fontWeight: 600 }],
    [
      'Bid price per MKR',
      calculatedBidPrice,
      { fontWeight: 600, color: hasSlippage ? 'red' : 'text' }
    ]
  ];

  const SummaryLine = ({ title, value, styling }) => (
    <Grid
      columns={2}
      sx={{
        justifyContent: 'space-between'
      }}
    >
      <Text
        sx={{
          fontSize: 1,
          textAlign: 'left'
        }}
      >
        {title}
      </Text>
      <Text
        sx={{
          fontSize: 1,
          textAlign: 'right',

          ...styling
        }}
      >
        {value}
      </Text>
    </Grid>
  );

  return (
    <Grid gap={2}>
      <Text variant="caps">Order Summary</Text>
      <Grid
        maxWidth={11}
        gap={2}
        rows={[2, 3, 4]}
        sx={{
          bg: 'background',
          p: 3,
          borderRadius: 'medium'
        }}
      >
        {fields.map(([title, value, styling]) => {
          return (
            <SummaryLine
              key={title}
              title={title}
              value={value}
              styling={styling}
            />
          );
        })}
      </Grid>
    </Grid>
  );
};

const byTimestamp = (prev, next) => {
  const nextTs = new Date(next.timestamp).getTime();
  const prevTs = new Date(prev.timestamp).getTime();

  if (nextTs > prevTs) return 1;
  if (nextTs < prevTs) return -1;
  if (nextTs === prevTs) {
    if (next.type === 'Dent') return 1;
    if (next.type === 'Deal') return 2;
    if (next.type === 'Kick') return -1;
  }
  return 0;
};

// Logic like this works on the assumption that
// all events for a given auction will be present
// and they will be sorted in descending order by timestamp
const checkUserBidStatus = (events, userAddress) => {
  const { type, fromAddress } = events[0];
  if (type !== 'Kick' && type !== 'Deal' && userAddress === fromAddress) {
    return TOP_BIDDER;
  }

  if (type === 'Deal') {
    const { fromAddress: bidderAddress } = events[1];
    if (bidderAddress.toLowerCase() === userAddress.toLowerCase())
      return WINNER;
  }

  return null;
};

const FlapAuctionBlock = ({
  events,
  id: auctionId,
  end,
  tic,
  stepSize,
  allowances
}) => {
  const { maker } = useMaker();
  const [currentLotBidAmount, setCurrentLotBidAmount] = useState(BigNumber(0));
  const { hasDaiJoinDaiAllowance, hasHope, hasMkrFlapAllowance } = allowances;
  const { callFlapTend, callFlapDeal } = useAuctionActions();
  const fetchAuctionsSet = useAuctionsStore(state => state.fetchFlapSet);
  const sortedEvents = events.sort(byTimestamp); // DEAL , [...DENT] , KICK ->

  const winnerSummary = {};
  const {
    bid: latestBid,
    lot: latestLot,
    fromAddress: latestBidder,
    hash: latestHash
  } = sortedEvents.find(event => event.type != 'Deal');

  const chickenDinner = checkUserBidStatus(
    sortedEvents,
    maker.currentAddress()
  );

  const [justBidded, setJustBidded] = useState(false);

  const BNwad = BigNumber.clone({
    DECIMAL_PLACES: 18,
    ROUNDING_MODE: BigNumber.ROUND_DOWN
  });
  const minMkrAsk = new BNwad(latestBid).times(stepSize);

  const hasDent = sortedEvents[0].type === 'Dent';

  const now = new Date().getTime();
  let auctionStatus = IN_PROGRESS;
  // if the auction has been dealt, it must be over
  if (sortedEvents[0].type === 'Deal') {
    auctionStatus = COMPLETED;
    winnerSummary.address = latestBidder;
    winnerSummary.tx = latestHash;
    // if `tic` is greater than 0, then a bid has been submitted. in this case...
    //  1. if the current time is later than `end`, the auction has finished, it just hasn't been dealt yet
    //  2. if `tic` is less than the current time, the auction can also be dealt
  } else if (tic.gt(0) && (new BigNumber(now).gt(end) || tic.lt(now))) {
    auctionStatus = CAN_BE_DEALT;
    // if a bid has NOT been submitted and the current time is later than `end`, the auction can be restarted (w a higher mkr price)
  } else if (tic.eq(0) && new BigNumber(now).gt(end)) {
    auctionStatus = CAN_BE_RESTARTED;
  }

  const handleTendCTA = value => {
    return callFlapTend(auctionId, latestLot, value);
  };

  const handleInstantBid = () => {
    return callFlapTend(auctionId, latestLot, minMkrAsk);
  };

  useEffect(() => {
    const timerID = setTimeout(async () => {
      const newEvents = await maker
        .service(AUCTION_DATA_FETCHER)
        .fetchFlapAuctionsByIds([auctionId]);
    }, 1000);
    return () => {
      clearInterval(timerID);
    };
  }, []);

  const canBid =
    hasDaiJoinDaiAllowance && hasHope[MCD_JOIN_DAI] && hasMkrFlapAllowance;

  const bidValidationTests = [
    [
      val => {
        return minMkrAsk.gt(val);
      },
      `Must ask for at least ${new BigNumber(stepSize)
        .minus(1)
        .multipliedBy(100)
        .toString()}% more MKR than the current bid`
    ]
  ];
  const calculatedBidPrice = BigNumber(latestLot).div(currentLotBidAmount);
  const minMkrAskPrice = BigNumber(latestLot).div(minMkrAsk);

  const priceThreshold = minMkrAskPrice.div(new BigNumber(1.1)); // 10% less

  // Warn that the MKR price in Dai of the user's bid seems too low
  const hasPriceSlippage = calculatedBidPrice.lt(priceThreshold);

  const printedLot =
    !currentLotBidAmount ||
    currentLotBidAmount.isNaN() ||
    !currentLotBidAmount.isFinite()
      ? '---'
      : currentLotBidAmount.toFixed(2);
  const printedPrice =
    !calculatedBidPrice ||
    calculatedBidPrice.isNaN() ||
    !calculatedBidPrice.isFinite()
      ? '---'
      : calculatedBidPrice.toFixed(2);

  return (
    <AuctionBlockLayout
      key={auctionId}
      latestEvent={{
        bid: new BigNumber(latestBid),
        lot: new BigNumber(latestLot)
      }}
      auctionStatus={auctionStatus}
      auctionId={auctionId}
      small={chickenDinner && UserBidStatusPills[chickenDinner]}
      winnerSummary={winnerSummary}
      hasDent={hasDent}
      end={end}
      tic={tic}
      actions={
        justBidded ? (
          <Box variant="styles.statusBox.success">
            You have successfully bid on that auction!
          </Box>
        ) : (
          <ActionTabs
            actions={[
              [
                'Instant Bid',
                <Flex
                  sx={{
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Box>
                    <MiniFormLayout
                      disabled={
                        auctionStatus !== IN_PROGRESS ||
                        !canBid ||
                        latestBid === 0
                      }
                      text={'Bid for the next minimum increment'}
                      buttonOnly
                      onSubmit={handleInstantBid}
                      onTxFinished={status => {
                        if (status === TX_SUCCESS) {
                          setJustBidded(true);
                          ReactGA.event({
                            category: 'bid',
                            action: 'instant',
                            label: auctionId
                          });
                        }
                        fetchAuctionsSet([auctionId]);
                      }}
                      onChange={() => {
                        setCurrentLotBidAmount(minMkrAsk);
                      }}
                      inputValidation={bidValidationTests}
                      actionText={'Bid Now'}
                    />
                  </Box>
                  <Box ml="auto">
                    <OrderSummary
                      key={`${latestLot}`}
                      currentBid={`${printedLot} MKR`}
                      minMkrAsk={`${minMkrAsk.toFixed(2, 1)} MKR`}
                      calculatedBidPrice={`${printedPrice} DAI`}
                    />
                  </Box>
                </Flex>,
                false,
                auctionStatus === CAN_BE_DEALT
              ],
              [
                'Custom Bid',
                <Flex
                  sx={{
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Box>
                    <MiniFormLayout
                      disabled={auctionStatus !== IN_PROGRESS || !canBid}
                      text={
                        'Enter the amount of MKR requested for this auction'
                      }
                      inputUnit="MKR"
                      onSubmit={handleTendCTA}
                      onTxFinished={status => {
                        if (status === TX_SUCCESS) {
                          setJustBidded(true);
                          ReactGA.event({
                            category: 'bid',
                            action: 'bid_custom',
                            label: auctionId
                          });
                        }

                        fetchAuctionsSet([auctionId]);
                      }}
                      onChange={inputState => {
                        const val = new BigNumber(inputState);

                        if (!currentLotBidAmount.eq(val)) {
                          setCurrentLotBidAmount(val);
                        }
                      }}
                      inputValidation={bidValidationTests}
                      actionText={'Bid Now'}
                    />
                  </Box>
                  <Box ml="auto">
                    <OrderSummary
                      key={`${currentLotBidAmount}`}
                      hasSlippage={hasPriceSlippage}
                      currentBid={`${printedLot} MKR`}
                      minMkrAsk={`${minMkrAsk.toFixed(2, 1)} MKR`}
                      calculatedBidPrice={`${printedPrice} DAI`}
                    />
                  </Box>
                </Flex>,
                false,
                auctionStatus === CAN_BE_DEALT
              ],
              auctionStatus === CAN_BE_DEALT && [
                'Deal Auction',

                <MiniFormLayout
                  disabled={auctionStatus !== CAN_BE_DEALT}
                  text={'Call deal to end auction and transfer DAI'}
                  buttonOnly
                  onTxFinished={status => {
                    if (status === TX_SUCCESS) {
                      setJustBidded(true);
                      ReactGA.event({
                        category: 'bid',
                        action: 'bid_deal',
                        label: auctionId
                      });
                    }

                    fetchAuctionsSet([auctionId]);
                  }}
                  onSubmit={() => callFlapDeal(auctionId)}
                  small={''}
                  actionText={'Call deal'}
                />
              ]
            ]}
          />
        )
      }
      auctionEvents={events.map(
        ({ type, lot, bid, timestamp, hash, fromAddress }, index) => {
          const eventBid = type === 'Deal' ? latestBid : bid;
          const eventLot = type === 'Deal' ? latestLot : lot;

          const mkrPrice = new BigNumber(eventBid).eq(new BigNumber(0))
            ? new BigNumber(0)
            : new BigNumber(eventLot).div(new BigNumber(eventBid));

          return (
            <AuctionEvent
              key={`${timestamp}-${index}`}
              type={type}
              tx={hash}
              sender={fromAddress}
              lot={new BigNumber(eventLot).toFormat(0, 6)}
              bid={`${new BigNumber(eventBid).toFormat(2, 4)} MKR`}
              mkrPrice={`${mkrPrice.toFormat(2, 4)} DAI`}
              timestamp={
                <Text>
                  <Moment format="HH:mm, DD MMM" withTitle>
                    {timestamp * 1000}
                  </Moment>
                </Text>
              }
            />
          );
        }
      )}
    />
  );
};

export default FlapAuctionBlock;

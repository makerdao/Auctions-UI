/** @jsx jsx */

import React, { useState } from 'react';
import {
  Heading,
  Text,
  jsx,
  Button,
  Grid,
  Box,
  Styled,
  Label,
  Input,
  Flex
} from 'theme-ui';
import BigNumber from 'bignumber.js';
import { getValueOrDefault } from '../utils';
import useAuctionActions from '../hooks/useAuctionActions';
import Moment from 'react-moment';
import EventsList from './AuctionEventsList';

const DentForm = ({ auctionId, lot, bid }) => {
  const [state, setState] = useState({ amount: undefined, error: undefined });
  const { callEthTend, callEthDent } = useAuctionActions();

  const handleTendCTA = event => {
    const bidAmount = state.amount;
    callEthTend(auctionId, lot, bidAmount);
  };

  const handleDentCTA = event => {
    const lotAmount = state.amount;
    callEthDent(auctionId, lotAmount, bid);
  };

  const bidDisabled = state.error || !state.amount;

  const maxBid = new BigNumber(0); // This should be taken from somewhere?

  const handleBidAmountInput = event => {
    const value = event.target.value;
    const state = { amount: undefined, error: undefined };

    if (value) {
      state.amount = new BigNumber(value);

      if (state.amount.lt(maxBid)) {
        state.error = 'Your bid is too low, you will need to increase.';
      }
    }

    setState(state);
  };

  return (
    <Grid gap={2}>
      <Text variant="boldBody">Enter your bid for this Auction</Text>
      <Flex
        sx={{
          flexDirection: ['column', 'row']
        }}
      >
        <Flex
          sx={{
            maxWidth: ['100%', '224px'],
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'muted',
            borderRadius: 'medium',
            fontSize: 3,
            // lineHeight: '24px',
            py: 3,
            px: 3
          }}
        >
          <Input
            sx={{
              border: 'none',
              outline: 'none',
              p: 0,
              marginRight: '2',
              borderRadius: 'medium'
            }}
            id="big-amount"
            type="number"
            step="0.01"
            placeholder="0"
            onChange={handleBidAmountInput}
          />
          <Label sx={{ p: 0, width: 'auto' }} htmlFor="bid-amount">
            DAI
          </Label>
        </Flex>
        <Button
          sx={{ ml: [0, 2], mt: [2, 0] }}
          variant="primary"
          disabled={bidDisabled}
          onClick={handleTendCTA}
        >
          Bid Now
        </Button>
      </Flex>
      {state.error && <Text variant="smallDanger">{state.error} </Text>}
      {/* <Text variant="small">Price 1 MKR = 300 DAI</Text> */}
    </Grid>
  );
};
const AuctionEvent = ({
  type,
  ilk,
  lot,
  currentBid,
  bid,
  timestamp,
  tx,
  sender
}) => {
  const fields = [
    ['Event Type', type],
    ['Collateral Type', ilk],
    ['Lot Size', lot],
    ['Unit Price', currentBid],
    ['Bid Value', bid],
    ['Time', timestamp],
    [
      'Tx',
      <a href={`https://etherscan.io/tx/${tx}`} target="_blank">
        {' '}
        {tx.slice(0, 7) + '...' + tx.slice(-4)}
      </a>
    ],
    [
      'Sender',
      <a href={`https://etherscan.io/address/${sender}`} target="_blank">
        {' '}
        {sender.slice(0, 7) + '...' + sender.slice(-4)}
      </a>
    ]
  ];
  return (
    <Grid
      gap={2}
      columns={[2, 3, 5]}
      sx={{
        bg: 'background',
        p: 3,
        borderRadius: 'medium'
      }}
    >
      {fields.map(([title, value]) => {
        return (
          <Box key={title}>
            <Text
              variant="caps"
              sx={{
                fontSize: '10px',
                mb: 1
              }}
            >
              {title}
            </Text>
            <Text
              sx={{
                fontSize: 1
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

const byTimestamp = (prev, next) => {
  const nextTs = new Date(next.timestamp).getTime();
  const prevTs = new Date(prev.timestamp).getTime();

  if (nextTs > prevTs) return 1;
  if (nextTs < prevTs) return -1;
  if (nextTs === prevTs) {
    if (next.type === 'Tend') return 1;
    if (next.type === 'Dent') return 2;
    if (next.type === 'Deal') return 3;
    if (next.type === 'Kick') return -1;
  }
  return 0;
};

export default ({ events: auctionEvents, id: auctionId }) => {
  const events = auctionEvents.sort(byTimestamp);

  const lot = events.sort(byTimestamp).map(a => a.lot)[0];
  const bid = events.sort(byTimestamp).map(a => a.bid)[0];

  const tab = events
    .sort(byTimestamp)
    .map(a => a.tab)
    .filter(Boolean);

  const hasDeal = events.find(e => e.type === 'Deal');
  const {
    lot: latestLot,
    bid: latestBid,
    currentBid: latestCurrentBid
  } = events.filter(e => e.type !== 'Deal')[0];

  return (
    <Grid
      gap={5}
      sx={{
        bg: '#fff',
        p: 6,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'muted'
      }}
    >
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between'
        }}
      >
        <Heading as="h5" variant="h2">
          Auction ID: {auctionId}
        </Heading>
        {/* <Heading
          as="h5"
          variant="h2"
          sx={{
            pt: [2, 0]
          }}
        >
          Time remaining: 1h 20m 20s
        </Heading> */}
      </Flex>
      <EventsList
        events={events.map(
          (
            { type, lot, bid, tab, timestamp, ilk, hash, fromAddress },
            index
          ) => {
            // const currentBid = new BigNumber(lot).eq(new BigNumber(0))
            // ? new BigNumber(lot)
            // : new BigNumber(bid).div(new BigNumber(lot));

            return (
              <AuctionEvent
                key={`${timestamp}-${index}`}
                type={type}
                tx={hash}
                sender={fromAddress}
                ilk={ilk.split('-')[0]}
                lot={
                  type === 'Deal'
                    ? new BigNumber(getValueOrDefault(latestLot)).toFormat(5, 4)
                    : new BigNumber(getValueOrDefault(lot)).toFormat(5, 4)
                }
                bid={
                  type === 'Deal'
                    ? new BigNumber(getValueOrDefault(latestBid)).toFormat(5, 4)
                    : new BigNumber(getValueOrDefault(bid)).toFormat(5, 4)
                }
                currentBid={
                  type === 'Deal'
                    ? `${new BigNumber(getValueOrDefault(latestBid))
                        .div(new BigNumber(getValueOrDefault(latestLot)))
                        .toFormat(5, 4)} DAI`
                    : `${new BigNumber(getValueOrDefault(bid))
                        .div(new BigNumber(getValueOrDefault(lot)))
                        .toFormat(5, 4)} DAI`
                }
                timestamp={
                  <Text title={new Date(timestamp)}>
                    <Moment fromNow ago>
                      {timestamp}
                    </Moment>{' '}
                    ago
                  </Text>
                }
              />
            );
          }
        )}
      />
      {true && <DentForm auctionId={auctionId} lot={lot} bid={bid} />}
    </Grid>
  );
};

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
  Select,
  Label,
  Input,
  Flex
} from 'theme-ui';
import CollapseToggle from './CollapseToggle';
import useAuctionsStore, { selectors } from '../stores/auctionsStore';
import useMaker from '../hooks/useMaker';

const gloss = [
  [
    'Dai Locked in the VAT',
    'This is the amount of Dai you have locked into the Maker Protocol that is available for bidding. You will need 50,000 Dai locked for each auction you wish to participate in.'
  ],
  [
    'Deposit/Withdraw DAI into the VAT',
    'This is where you add or remove DAI that can be used for bidding. This goes into the VAT and will be reflected on the ‘Dai Locked in the VAT’ balance.'
  ],
  [
    'Kick',
    'The first event in an auction, and refers to the auction starting. It sets the initial price (200 MKR/DAI) and allows you to start bidding on it.'
  ],
  [
    'Dent',
    'These are bid events, where users are bidding decreasing amounts of MKR for a set amount of Dai.'
  ],
  [
    'Deal',
    'The end of the auction, and is called when the total time of the auction has elapsed. When Deal is called, the MKR will be sent to the winning bidder.'
  ],
  [
    'Bid Value',
    'The amount of Dai that is being bid on the Lot Size. This value is fixed at 50,000 DAI for each bid.'
  ],
  [
    'Lot Size',
    'The amount of MKR that is currently being bid for the Bid Value (50,000 Dai). Each new bid will have to bid a lower Lot Size (amount of MKR) to be successful.'
  ],
  [
    'MKR Price',
    'The current price that is being bid for MKR in Dai. As each bid is for a decreasing amount of MKR, the bid price will increase after each successful bid.'
  ],
  [
    'Sender',
    'The address of the user who made the bid(dent), kick or deal event.'
  ],
  [
    'Instant Bid',
    'This allows you to bid for the pre-definied next available amount. For example, if the current bid is 200MKR, the next available bid is 194MKR and Instant Bid will calculate this for you.'
  ],
  [
    'Custom Bid',
    'This allows you to bid any amount of MKR, providing it is at least 3% lower than the current best bid.'
  ],

  [
    'Deal Auction/Call Deal',
    'This becomes available once the auction time has expired. This can be called by anyone, and it is needed to give the winner bidder their MKR.'
  ],
  [
    'Auction Completed',
    'This signifies that the auction has fully completed, and has been ‘Dealt’. You can see the amount of MKR that won (Lot Size) and the Price in the ‘Deal’ event within the auction details.'
  ],
  [
    'Current Winning Bidder',
    'This indicates that your bid is currently the best bid. If the auction has ended, and the button ‘Deal Auction’ is available, you should click it and then ‘Call Deal’ to claim your MKR.'
  ],
  [
    'Show Only Participating',
    'This filter option allows you to filter by all the bids you have participated in (winning or not).'
  ]
];

const AuctionFilters = ({ title, text, action, forceExpanded }) => {
  const { maker, web3Connected } = useMaker();

  const filterByIdValue = useAuctionsStore(state => state.filterByIdValue);
  const [collapsed, setCollapsed] = useState(filterByIdValue ? false : true);
  const [collapsedGloss, setCollapsedGloss] = useState(true);

  const sortCriteria = useAuctionsStore(state => state.sortBy);
  const filterByCurrentBidder = useAuctionsStore(
    state => state.filterByCurrentBidder
  );
  const filterByNotCompleted = useAuctionsStore(
    state => state.filterByNotCompleted
  );
  const setSortBy = useAuctionsStore(state => state.setSortBy);
  const setFilterByIdValue = useAuctionsStore(
    state => state.setFilterByIdValue
  );
  const setFilterByBidderValue = useAuctionsStore(
    state => state.setFilterByBidderValue
  );
  const toggleFilterByCurrentBidder = useAuctionsStore(
    state => state.toggleFilterByCurrentBidder
  );

  const toggleFilterByNotCompleted = useAuctionsStore(
    state => state.toggleFilterByNotCompleted
  );

  const filters = [
    [
      'Filter by ID',
      <Input
        sx={{
          bg: 'white',
          borderColor: 'muted',
          width: ['100%', '280px']
        }}
        value={filterByIdValue}
        placeholder="Auction ID"
        onChange={({ target: { value } }) => setFilterByIdValue(value)}
      />
    ],
    [
      'Filter By Bidder Address',
      <Input
        sx={{
          bg: 'white',
          borderColor: 'muted',
          width: ['100%', '280px']
        }}
        placeholder="Bidder Address"
        onChange={({ target: { value } }) => setFilterByBidderValue(value)}
      />
    ]
  ];

  const toggles = [
    [
      '',
      <Button
        variant={filterByNotCompleted ? 'small' : 'smallOutline'}
        onClick={toggleFilterByNotCompleted}
      >
        Hide Completed Auctions
      </Button>
    ],
    [
      '',
      <Button
        variant={filterByCurrentBidder ? 'small' : 'smallOutline'}
        onClick={() => toggleFilterByCurrentBidder(maker.currentAddress())}
      >
        Show Only Participating
      </Button>
    ]
  ];

  return (
    <Box
      sx={{
        p: 0,
        mb: 4
      }}
    >
      <Flex
        sx={{
          // p: 6,
          py: 0,
          alignItems: ['flex-start', 'flex-end'],
          flexDirection: ['column', 'row'],
          width: '100%'
        }}
      >
        <Flex
          sx={{
            alignItems: 'flex-end'
          }}
        >
          <Button
            key={''}
            variant={collapsed ? 'smallOutline' : 'small'}
            sx={{
              mr: 2
            }}
            onClick={() => (forceExpanded ? null : setCollapsed(!collapsed))}
          >
            Filter By...
          </Button>
          <Box>
            <Button
              variant={collapsedGloss ? 'smallOutline' : 'small'}
              onClick={() => setCollapsedGloss(!collapsedGloss)}
            >
              Glossary
            </Button>
          </Box>
        </Flex>
        <Box ml={[0, 'auto']} mt={[4, 0]}>
          <Select
            sx={{
              width: ['100%', '300px'],
              // height: 7,
              // fontSize: 0,
              borderColor: 'muted',
              bg: 'white'
            }}
            defaultValue="Sort By Id (Desc)"
            onChange={({ target: { value } }) => setSortBy(value)}
          >
            <option value="byLatestDesc">Sort By Id (Desc)</option>
            <option value="byLatestAsc">Sort By Id (Asc)</option>
            <option value="byTimeAsc">Time Remaining (Asc)</option>
            <option value="byTimeDesc">Time Remaining (Desc)</option>
            <option value="byBidPriceAsc">Current Bid Price (Asc)</option>
            <option value="byBidPriceDesc">Current Bid Price (Desc)</option>
          </Select>
        </Box>
      </Flex>
      {collapsedGloss ? null : (
        <Box>
          <Box
            px="6"
            pb="4"
            mt="4"
            sx={{
              variant: 'styles.roundedCard'
            }}
          >
            <Grid gap={6} columns={[1, 2]}>
              {gloss.map(([title, text]) => {
                return (
                  <Box>
                    <Text mb="1" variant="boldBody">
                      {title}
                    </Text>
                    <Text>
                      {/* <Text mb="2" variant="boldBody" as="span">{title}{" "}</Text> */}
                      {text}
                    </Text>
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </Box>
      )}
      {collapsed ? null : (
        <Box
          px="6"
          pb="4"
          mt="4"
          sx={{
            variant: 'styles.roundedCard'
          }}
        >
          <Text variant="caps" mb="4">
            Show or hide
          </Text>
          <Flex
            sx={{
              flexDirection: ['column', 'row']
            }}
          >
            {toggles.map(([text, body], index) => {
              return (
                <Box
                  sx={{
                    mr: [0, 4],
                    mb: [4, 0]
                  }}
                  key={index}
                >
                  {body}
                </Box>
              );
            })}
          </Flex>
          <Flex
            mt="6"
            sx={{
              flexDirection: ['column', 'row']
            }}
          >
            {filters.map(([text, body], index) => {
              return (
                <Box
                  sx={{
                    mr: [0, 4],
                    mb: [4, 0]
                  }}
                  key={index}
                >
                  <Text
                    variant="caps"
                    sx={{
                      mb: 2
                    }}
                  >
                    {text}
                  </Text>
                  {body}
                </Box>
              );
            })}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default AuctionFilters;

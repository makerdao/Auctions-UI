/** @jsx jsx */
import React from 'react';
import Head from 'next/head';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import IntroInfoCard from '../components/IntroInfoCard';
import HwInstructionsMDX from '../text/hwInstructions.mdx';
import { Heading, jsx, Box, Text, Flex } from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';
export function fromRad(value) {
  return BigNumber(value).shiftedBy(-45);
}

const questionAnswerPairs = [
  {
    question: `What are debt auctions?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        Debt Auctions are used to recapitalize the Dai credit system by
        auctioning off MKR for a fixed amount of DAI. In this process, bidders
        compete by offering to accept decreasing amounts of MKR in exchange for
        said fixed amount of DAI.{' '}
      </Text>
    )
  },
  {
    question: `When do debt auctions happen?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        Debt Auctions are triggered when the system has Dai debt that has passed
        a specified debt limit, they are not planned to set dates prior to the
        debt limit being reached. After liquidation occurs, the corresponding
        debt is immediately placed in a "debt queue" and then processed for 6.5
        days. Once processed, debt auctions happen individually in portions of
        preset 50k bids for a lot size of 250MKR.
      </Text>
    )
  },
  {
    question: `How long do auctions last after the first bid?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        After an initial bid, each auctions lasts for six hours.
      </Text>
    )
  },
  {
    question: `What happens if no one bids?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        If no one bids on an auction, it will expire in three days. After this
        expiration date the auction will automatically be repriced.
      </Text>
    )
  },
  {
    question: `If no auctions happen in the first 3 days, what will the new starting price be?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        The new starting price for the previously expired auction will be an
        increase of 20% in the amount of MKR offered for 50K DAI, ie. the lot
        size will increase. This implies a lower price of MKR to start the
        bidding. For example, if an initial auction has a starting bid of 50K
        DAI for a lot of 250MKR and it expires, the next auction would start at
        50K DAI for 300MKR(250*.20+250).
      </Text>
    )
  },
  {
    question: `How do competitive bids happen in an auction?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        To place a competitive bid on a auction, a user must decrease the
        requested MKR or lot size by minimum of 3%, which would imply a higher
        price. For example, the starting bid for MKR is 50K DAI for 250MKR which
        means the next possible competitive bid would be,50K DAI for 242.5MKR
        (250 - 3%) which would imply a MKR price of 206.18 instead of 200.
      </Text>
    )
  },
  {
    question: `What happens to my current bid if a new bid is received from another user?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        Your Dai submitted in the current bid is immediately refunded back to
        your address when a new bid is accepted from another bidder in the
        auction.
      </Text>
    )
  },
  {
    question: `At what point is MKR minted? How is the MKR distributed after a completed auction?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        MKR is minted when the winning bidder executes deal to finalize their
        bid for the lot size after the current time goes past either bid expiry
        or auction expiry, whichever happens first. Maker protocol mints the MKR
        amount specified in the lot size submitted by the winning bidder and
        this MKR is sent to their address.
      </Text>
    )
  },
  {
    question: `Who can participate in debt auctions? `,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        Anyone can participate in debt auctions. The only requirement is that
        you must have a minimum of 50K DAI to bid on lots of MKR.
      </Text>
    )
  },
  {
    question: `How many auctions take place at the same time?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        There is no limit to the number of auctions that can take place at the
        same time. Debt auctions occur simultaneously when enough system debt is
        unblocked and ready to be processed.
      </Text>
    )
  },
  {
    question: `How are debt auctions different from collateral auctions?`,
    answer: (
      <Text sx={{ pt: 4, pb: 1 }}>
        Collateral auctions occur in two phases - the first phase allows bidders
        to adjust the bid amounts, and the second phase allows bidders to
        decrease the collateral lot size requested with the bid amount constant.
        <br />
        <br />
        Debt auctions only occur in a single phase which only allows bidders to
        decrease the MKR lot size requested for a fixed dai bid amount.
      </Text>
    )
  },
  {
    question: `How to Hardware Wallet with debt auctions?`,
    answer: <HwInstructionsMDX />
  }
];

const Index = () => {
  return (
    <GuttedLayout maxWidth="970px">
      <Box
        sx={{
          pb: 4
        }}
      >
        <Head>
          <title>FAQ</title>
        </Head>
        <Heading variant="h2" py="4">
          Frequently Asked Questions
        </Heading>
        {questionAnswerPairs.map((pair, index) => (
          <IntroInfoCard
            collapsed={index !== 0}
            title={pair.question}
            text={pair.answer}
          />
        ))}
      </Box>
    </GuttedLayout>
  );
};

export default Index;

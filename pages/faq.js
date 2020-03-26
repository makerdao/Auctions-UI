/** @jsx jsx */
import React from 'react';
import Head from 'next/head';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import IntroInfoCard from '../components/IntroInfoCard';
import {
  Heading,
  jsx,
  Box,
  Text,
} from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';
export function fromRad(value) {
  return BigNumber(value).shiftedBy(-45);
}

const questionAnswerPairs = [
  {
    question: `What are debt Auctions?`,
    answer: `Debt Auctions are used to recapitalize the Dai credit system by auctioning off MKR for a fixed amount of DAI. In this process, bidders compete by offering to accept decreasing amounts of MKR in exchange for said fixed amount of DAI`
  },
  {
    question: `What are debt Auctions?`,
    answer: `Debt Auctions are used to recapitalize the Dai credit system by auctioning off MKR for a fixed amount of DAI. In this process, bidders compete by offering to accept decreasing amounts of MKR in exchange for said fixed amount of DAI`
  },
  {
    question: `What are debt Auctions?`,
    answer: `Debt Auctions are used to recapitalize the Dai credit system by auctioning off MKR for a fixed amount of DAI. In this process, bidders compete by offering to accept decreasing amounts of MKR in exchange for said fixed amount of DAI`
  }
]

const Index = () => {
  return (
    <GuttedLayout maxWidth="970px">
      <Box
        sx={{
          pb: 5
        }}
      >
        <Head>
          <title>FAQ</title>
        </Head>
        <Heading variant="h1" py="7">
          Frequently Asked Questions
        </Heading>
        {
          questionAnswerPairs.map((pair, index) => (
            <IntroInfoCard
              collapsed={index !== 0}
              title={<Text sx={{ fontWeight: 'bold' }}>{pair.question}</Text>}
              text={<Text sx={{ pt: 5, pb: 1 }}>{pair.answer}</Text>}
            />
          ))
        }
      </Box>
    </GuttedLayout>
  );
};

export default Index;
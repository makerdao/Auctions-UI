/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import Link from 'next/link';
import {
  Heading,
  Text,
  jsx,
  Box,
  Link as StyledLink,
  Button,
  Styled,
  Input,
  Flex
} from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';
import ReactGA from 'react-ga';

export function fromRad(value) {
  return BigNumber(value).shiftedBy(-45);
}

const Index = () => {
  const { maker, web3Connected } = useMaker();

  useEffect(() => {
    if (window !== undefined) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <GuttedLayout>
      <Box>
        <Head>
          <title>Maker Auctions</title>
        </Head>

        {/* <Text variant="boldBody">Welcome to Maker auctions</Text> */}
        <Heading
          variant="h2"
          sx={{
            py: 4
          }}
        >
          Maker Auctions
        </Heading>

        {/* <Box sx={{ my: 2 }}>
          <Link href="/flip">
            <StyledLink variant="nav">Collateral Auctions →</StyledLink>
          </Link>
        </Box> */}
        <Box pt="3">
          <Link href="/flop">
            <StyledLink variant="nav">Debt Auctions →</StyledLink>
          </Link>
        </Box>
      </Box>
    </GuttedLayout>
  );
};

export default Index;

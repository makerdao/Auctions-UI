/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import Link from 'next/link';
import TermsMDX from '../text/terms.mdx';
import {
  Heading,
  Text,
  jsx,
  Box,
  Link as StyledLink,
  Button,
  Styled,
  Input,
  Flex,
  Card
} from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';
export function fromRad(value) {
  return BigNumber(value).shiftedBy(-45);
}

const Index = () => {
  const { maker, web3Connected } = useMaker();

  return (
    <GuttedLayout maxWidth="970px">
      <Box
        sx={{
          pb: 3
        }}
      >
        <Head>
          <title>Terms</title>
        </Head>
        <Heading variant="h2" py="5">
          Terms of Service
        </Heading>

        <Card
          sx={{
            px: 3,
            py: 3
          }}
        >
          <TermsMDX />
        </Card>
      </Box>
    </GuttedLayout>
  );
};

export default Index;

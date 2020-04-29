/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import {
  Heading,
  Text,
  jsx,
  Box,
  Button,
  Grid,
  Styled,
  Input,
  Flex
} from 'theme-ui';

const BalanceOf = ({
  type,
  balance,
  vatBalance,
  actions,
  shouldUnlock,
  unlock
}) => {
  if (shouldUnlock) {
    return <Box>{unlock}</Box>;
  }
  return (
    <Flex
      sx={{
        variant: 'styles.roundedCard',
        // bg: '#fff',
        // p: 6,
        // borderRadius: 5,
        // border: '1px solid',
        // borderColor: 'muted',
        alignItems: 'center'
      }}
    >
      <Grid
        gap={0}
        columns={[1]}
        sx={{
          flexDirection: ['column', 'row'],
          justifyItems: 'start',
          alignItems: 'center'
        }}
      >
        <Grid
          gap={0}
          sx={{
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Text variant="caps">{type}</Text>
          <Text variant="bigText">{balance}</Text>
          <Box ml="auto">{actions}</Box>
        </Grid>

        {vatBalance ? (
          <Box>
            <Text variant="boldBody">{vatBalance} Dai in the VAT</Text>
          </Box>
        ) : null}
      </Grid>
    </Flex>
  );
};

export default BalanceOf;

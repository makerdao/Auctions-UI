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

const BalanceFormVat = ({ joinDaiToAdapter, exitDaiFromAdapter }) => {
  const [amount, setAmount] = useState(null);
  return (
    <Grid gap={2} columns={3}>
      <Input
        onChange={ev => setAmount(ev.target.value)}
        sx={{
          borderColor: 'muted'
        }}
      ></Input>
      <Button
        onClick={() => {
          joinDaiToAdapter(amount);
        }}
        disabled={!amount}
      >
        Deposit
      </Button>
      <Button
        onClick={() => {
          exitDaiFromAdapter(amount);
        }}
        disabled={!amount}
      >
        Withdraw
      </Button>
    </Grid>
  );
};

export default BalanceFormVat;

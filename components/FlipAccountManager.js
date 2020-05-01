/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import useAllowances from '../hooks/useAllowances';
import { Text, jsx, Box, Button, Grid, Card } from 'theme-ui';
import BalanceFormVat from './BalanceFormVat';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from '../components/AccountManagerLayout';
import ActionTabs from './ActionTabs';
import MiniFormLayout from './MiniFormLayout';
import { formatBalance } from '../utils';

export default () => {
  const { maker, web3Connected } = useMaker();
  let {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter
  } = useBalances();

  daiBalance = formatBalance(daiBalance);
  vatDaiBalance = formatBalance(vatDaiBalance);
  mkrBalance = formatBalance(mkrBalance);

  const {
    hasDaiAllowance,
    hasMkrAllowance,
    hasEthFlipHope,
    hasJoinDaiHope,
    giveDaiAllowance,
    giveMkrAllowance,
    giveFlipEthHope,
    giveJoinDaiHope
  } = useAllowances();

  const [daiApprovePending, setDaiApprovePending] = useState(false);
  const [mkrApprovePending, setMkrApprovePending] = useState(false);
  const [hopeApprovePending, setHopeApprovePending] = useState(false);

  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => {
    if (web3Connected) {
      (async () => {
        const joinDaiAdapterAddress = maker
          .service('smartContract')
          .getContractByName('MCD_JOIN_DAI').address;
        setJoinAddress(joinDaiAdapterAddress);
      })();
    }
  }, [maker, web3Connected]);

  const allowanceMissing =
    !hasDaiAllowance || !hasEthFlipHope || !hasJoinDaiHope;

  const hasNoAllowances =
    !hasDaiAllowance && !hasEthFlipHope && !hasJoinDaiHope;

  return (
    <AccountManagerLayout
      topActions={
        <Grid>
          {!web3Connected ? (
            <Text as="h2" variant="boldBody">
              Connect your wallet to get started.
            </Text>
          ) : allowanceMissing ? (
            <Text as="h2" variant="boldBody">
              To participate in auctions you need to sign these 3 approval
              transactions
            </Text>
          ) : null}
          <Grid
            gap={3}
            columns={[1, 3]}
            sx={{
              flexDirection: ['column', 'row'],
              justifyItems: 'start',
              mr: 'auto'
            }}
          ></Grid>
        </Grid>
      }
      balances={
        <Box>
          {web3Connected ? (
            <Grid
              gap={3}
              columns={[1, 3]}
              sx={{
                pt: 0,
                pb: 3
              }}
            >
              <BalanceOf
                type={'Dai in your Wallet'}
                balance={`${daiBalance} DAI`}
                shouldUnlock={!hasDaiAllowance}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI wallet balance - {daiBalance}
                      </Text>

                      <Button
                        variant="small"
                        onClick={() => giveDaiAllowance(joinAddress)}
                        disabled={!web3Connected}
                      >
                        {hasDaiAllowance
                          ? 'Dai Unlocked'
                          : 'Unlock Dai in your wallet'}
                      </Button>
                    </Grid>
                  </Card>
                }
              />
              <BalanceOf
                type={'Dai in Adapter'}
                balance={`${vatDaiBalance} DAI`}
                shouldUnlock={!hasEthFlipHope}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI wallet balance - {vatDaiBalance}
                      </Text>

                      <Button
                        variant="small"
                        onClick={() => {
                          const flipEthAddress = maker
                            .service('smartContract')
                            .getContractByName('MCD_FLIP_ETH_A').address;
                          giveFlipEthHope(flipEthAddress);
                        }}
                        disabled={!web3Connected}
                      >
                        Unlock Dai in the adapter
                      </Button>
                    </Grid>
                  </Card>
                }
                vatActions={
                  <BalanceFormVat
                    joinDaiToAdapter={joinDaiToAdapter}
                    exitDaiFromAdapter={exitDaiFromAdapter}
                  />
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'muted'
                }}
              />

              {!hasJoinDaiHope ? (
                <Card>
                  <Grid gap={2}>
                    <Text variant="caps">DAI wallet balance</Text>
                    <Button
                      variant="small"
                      onClick={() => giveJoinDaiHope(joinAddress)}
                      disabled={!web3Connected || hasJoinDaiHope}
                    >
                      Unlock Dai in the VAT
                    </Button>
                  </Grid>
                </Card>
              ) : null}
            </Grid>
          ) : null}
          {hasNoAllowances ? null : (
            <Card>
              <Grid>
                <ActionTabs
                  actions={[
                    [
                      'Deposit DAI to Adapter',
                      <Grid>
                        <Box
                          sx={{
                            bg: 'background',
                            p: 3,
                            borderRadius: 'medium'
                          }}
                        >
                          <MiniFormLayout
                            text={'Deposit DAI to the Adapter'}
                            disabled={false}
                            inputUnit="DAI"
                            onSubmit={joinDaiToAdapter}
                            small={''}
                            actionText={'Deposit'}
                          />
                        </Box>
                      </Grid>
                    ],
                    [
                      'Withdraw DAI From Adapter',
                      <Grid>
                        <Box
                          sx={{
                            bg: 'background',
                            p: 3,
                            borderRadius: 'medium'
                          }}
                        >
                          <MiniFormLayout
                            text={'Withdraw DAI from the Adapter'}
                            disabled={false}
                            inputUnit="DAI"
                            onSubmit={exitDaiFromAdapter}
                            small={''}
                            actionText={'Withdraw'}
                          />
                        </Box>
                      </Grid>
                    ]
                  ]}
                />
              </Grid>
            </Card>
          )}
        </Box>
      }
    />
  );
};

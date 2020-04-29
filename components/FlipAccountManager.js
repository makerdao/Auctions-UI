/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import useAllowances from '../hooks/useAllowances';
import { Text, jsx, Box, Button, Grid } from 'theme-ui';
import BalanceFormVat from './BalanceFormVat';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from '../components/AccountManagerLayout';
import ActionTabs from './ActionTabs';
import MiniFormLayout from './MiniFormLayout';

export default () => {
  const { maker, web3Connected } = useMaker();
  const {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter
  } = useBalances();

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
            gap={4}
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
              gap={4}
              columns={3}
              sx={{
                pt: 0,
                pb: 4
              }}
            >
              <BalanceOf
                type={'Dai in your Wallet'}
                balance={daiBalance}
                shouldUnlock={!hasDaiAllowance}
                unlock={
                  <Grid
                    gap={2}
                    sx={{
                      variant: 'styles.roundedCard'
                    }}
                  >
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
                }
              />
              <BalanceOf
                type={'Dai in Adaptor'}
                balance={vatDaiBalance}
                shouldUnlock={!hasEthFlipHope}
                unlock={
                  <Grid
                    gap={2}
                    sx={{
                      variant: 'styles.roundedCard'
                    }}
                  >
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
                <Grid
                  gap={2}
                  sx={{
                    variant: 'styles.roundedCard'
                  }}
                >
                  <Text variant="caps">DAI wallet balance</Text>
                  <Button
                    variant="small"
                    onClick={() => giveJoinDaiHope(joinAddress)}
                    disabled={!web3Connected || hasJoinDaiHope}
                  >
                    Unlock Dai in the VAT
                  </Button>
                </Grid>
              ) : null}
            </Grid>
          ) : null}
          {hasNoAllowances ? null : (
            <Grid
              sx={{
                variant: 'styles.roundedCard'
              }}
            >
              <ActionTabs
                actions={[
                  [
                    'Deposit DAI to Adapter',
                    <Grid>
                      <Box
                        sx={{
                          bg: 'background',
                          p: 4,
                          borderRadius: 6
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
                          p: 4,
                          borderRadius: 6
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
          )}
        </Box>
      }
    />
  );
};

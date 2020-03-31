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
import { formatBalance } from '../utils';
import { MCD_FLIP_BAT_A, MCD_JOIN_DAI, MCD_FLIP_ETH_A } from '../constants';

export default () => {
  const { maker, web3Connected } = useMaker();
  let {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    batBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter
  } = useBalances();

  daiBalance = formatBalance(daiBalance);
  vatDaiBalance = formatBalance(vatDaiBalance);
  mkrBalance = formatBalance(mkrBalance);

  const {
    hasDaiAllowance,
    giveDaiAllowance,
    giveHope,
    hasHope
  } = useAllowances();

  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => {
    if (web3Connected) {
      (async () => {
        const joinDaiAdapterAddress = maker
          .service('smartContract')
          .getContractByName(MCD_JOIN_DAI).address;
        setJoinAddress(joinDaiAdapterAddress);
      })();
    }
  }, [maker, web3Connected]);

  const allowanceMissing =
    !hasDaiAllowance || !hasHope[MCD_FLIP_ETH_A] || !hasHope[MCD_JOIN_DAI];

  const hasNoAllowances =
    !hasDaiAllowance && !!hasHope[MCD_FLIP_ETH_A] && !hasHope[MCD_JOIN_DAI];

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
                      variant="pill"
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
                type={'Dai in Adapter'}
                balance={vatDaiBalance}
                shouldUnlock={!hasHope[MCD_FLIP_ETH_A]}
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
                      variant="pill"
                      onClick={() => {
                        const flipEthAddress = maker
                          .service('smartContract')
                          .getContractByName(MCD_FLIP_ETH_A).address;
                        giveHope(flipEthAddress, MCD_FLIP_ETH_A);
                      }}
                      disabled={!web3Connected}
                    >
                      Unlock ETH in the VAT
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
                  borderColor: 'border'
                }}
              />

              <BalanceOf
                type={'Bat Balance'}
                balance={batBalance}
                shouldUnlock={!hasHope[MCD_FLIP_BAT_A]}
                unlock={
                  <Grid
                    gap={2}
                    sx={{
                      variant: 'styles.roundedCard'
                    }}
                  >
                    <Text variant="caps">
                      BAT wallet balance - {batBalance}
                    </Text>

                    <Button
                      variant="pill"
                      onClick={() => {
                        const flipBatAddress = maker
                          .service('smartContract')
                          .getContractByName(MCD_FLIP_BAT_A).address;
                        giveHope(flipBatAddress, MCD_FLIP_BAT_A);
                      }}
                      disabled={!web3Connected}
                    >
                      Unlock BAT in the VAT
                    </Button>
                  </Grid>
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'border'
                }}
              />

              {hasHope[MCD_JOIN_DAI] === false ? (
                <Grid
                  gap={2}
                  sx={{
                    variant: 'styles.roundedCard'
                  }}
                >
                  <Text variant="caps">DAI wallet balance</Text>
                  <Button
                    variant="pill"
                    onClick={() => giveHope(joinAddress, MCD_JOIN_DAI)}
                    disabled={!web3Connected || hasHope[MCD_JOIN_DAI]}
                  >
                    Unlock DAI in the VAT
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
                          text={'Deposit DAI into the VAT'}
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
                    'Withdraw DAI into the VAT',
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

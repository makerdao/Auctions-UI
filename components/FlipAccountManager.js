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
import { MCD_FLIP_BAT_A, MCD_JOIN_DAI, MCD_FLIP_ETH_A } from '../constants';

const FlipAccountManager = ({ ilk }) => {
  const { maker, web3Connected } = useMaker();
  let {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    batBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter,
    updateDaiBalances
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
              To participate in auctions you need to sign the approvals
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
                shouldUnlock={!hasHope[MCD_JOIN_DAI]}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI wallet balance - {vatDaiBalance}
                      </Text>

                      <Button
                        variant="small"
                        onClick={() => giveHope(joinAddress, MCD_JOIN_DAI)}
                        disabled={!web3Connected || hasHope[MCD_JOIN_DAI]}
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

              {ilk ? (
                <Card>
                  <Grid gap={2}>
                    <Text variant="caps">{`Enable ${ilk} Auctions`}</Text>
                    <Button
                      variant="small"
                      onClick={() => {
                        const flipAddress = maker
                          .service('smartContract')
                          .getContractByName(
                            `MCD_FLIP_${ilk.replace('-', '_')}`
                          ).address;
                        giveHope(
                          flipAddress,
                          `MCD_FLIP_${ilk.replace('-', '_')}`
                        );
                      }}
                      disabled={
                        !web3Connected ||
                        hasHope[`MCD_FLIP_${ilk.replace('-', '_')}`]
                      }
                    >
                      {hasHope[`MCD_FLIP_${ilk.replace('-', '_')}`]
                        ? `${ilk} Unlocked`
                        : `Unlock ${ilk}`}
                    </Button>
                  </Grid>
                </Card>
              ) : null}
              {/* {!ilk || ilk === 'BAT-A' ? (
                <Card>
                  <Grid gap={2}>
                    <Text variant="caps">Enable BAT Auctions</Text>
                    <Button
                      variant="small"
                      onClick={() => {
                        const flipBatAddress = maker
                          .service('smartContract')
                          .getContractByName(MCD_FLIP_BAT_A).address;
                        giveHope(flipBatAddress, MCD_FLIP_BAT_A);
                      }}
                      disabled={!web3Connected || hasHope[MCD_FLIP_BAT_A]}
                    >
                      {hasHope[MCD_FLIP_BAT_A] ? 'BAT Unlocked' : 'Unlock BAT'}
                    </Button>
                  </Grid>
                </Card>
              ) : null} */}
              {/* {!ilk || ilk === 'ETH-A' ? (
                <Card>
                  <Grid gap={2}>
                    <Text variant="caps">Enable ETH Auctions</Text>
                    <Button
                      variant="small"
                      onClick={() => {
                        const flipEthAddress = maker
                          .service('smartContract')
                          .getContractByName(MCD_FLIP_ETH_A).address;
                        giveHope(flipEthAddress, MCD_FLIP_ETH_A);
                      }}
                      disabled={!web3Connected || hasHope[MCD_FLIP_ETH_A]}
                    >
                      {hasHope[MCD_FLIP_ETH_A] ? 'ETH Unlocked' : 'Unlock ETH'}
                    </Button>
                  </Grid>
                </Card>
              ) : null} */}
            </Grid>
          ) : null}
          {hasNoAllowances ? null : (
            <Card>
              <Grid>
                <ActionTabs
                  actions={[
                    [
                      'Deposit DAI to Adapter',
                      <Grid key="dai-adapter">
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
                            onTxFinished={updateDaiBalances}
                            small={''}
                            actionText={'Deposit'}
                          />
                        </Box>
                      </Grid>
                    ],
                    [
                      'Withdraw DAI From Adapter',
                      <Grid key="dai-vat">
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
                            onTxFinished={updateDaiBalances}
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

export default FlipAccountManager;

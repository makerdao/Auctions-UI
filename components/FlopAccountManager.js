/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import { Text, jsx, Box, Button, Grid } from 'theme-ui';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from '../components/AccountManagerLayout';
import ActionTabs from './ActionTabs';
import MiniFormLayout from './MiniFormLayout';
import { formatBalance } from '../utils';
import ReactGA from 'react-ga';
import { AUCTION_DATA_FETCHER } from '../constants';

export default ({ allowances }) => {
  const { maker, web3Connected } = useMaker();
  let {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter,
    updateDaiBalances
  } = useBalances();

  daiBalance = formatBalance(daiBalance);
  vatDaiBalance = formatBalance(vatDaiBalance);
  mkrBalance = formatBalance(mkrBalance);

  const {
    hasDaiAllowance,
    hasMkrAllowance,
    hasEthFlipHope,
    hasJoinDaiHope,
    hasFlopHope,
    giveDaiAllowance,
    giveMkrAllowance,
    giveFlipEthHope,
    giveJoinDaiHope,
    giveFlopHope
  } = allowances;

  const [joinAddress, setJoinAddress] = useState('');

  useEffect(() => {
    if (web3Connected) {
      const joinDaiAdapterAddress = maker.service(AUCTION_DATA_FETCHER)
        .joinDaiAdapterAddress;
      setJoinAddress(joinDaiAdapterAddress);
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
              To participate in auctions you need to sign the approval
              transactions below and move Dai that will be used for bidding to
              the Vat.
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
              columns={[1, 3]}
              sx={{
                pt: 0,
                pb: 4
              }}
            >
              <BalanceOf
                type={'Dai in your Wallet'}
                balance={`${daiBalance} DAI`}
                shouldUnlock={!hasDaiAllowance}
                unlock={
                  <Grid
                    gap={4}
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
                type={'Dai locked in the Vat '}
                balance={`${vatDaiBalance} DAI`}
                shouldUnlock={!hasJoinDaiHope}
                unlock={
                  <Grid
                    gap={4}
                    sx={{
                      variant: 'styles.roundedCard'
                    }}
                  >
                    <Text variant="caps">
                      DAI Adapter Balance - {vatDaiBalance}
                    </Text>
                    <Button
                      variant="small"
                      onClick={() => giveJoinDaiHope(joinAddress)}
                      disabled={!web3Connected || hasJoinDaiHope}
                    >
                      Unlock Dai in the VAT
                    </Button>
                  </Grid>
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'muted'
                }}
              />
              <BalanceOf
                type={'MKR in your wallet'}
                balance={`${mkrBalance} MKR`}
                shouldUnlock={!hasFlopHope}
                unlock={
                  <Grid
                    gap={4}
                    sx={{
                      variant: 'styles.roundedCard'
                    }}
                  >
                    <Text variant="caps">Enable Debt Auctions</Text>
                    <Button
                      variant="small"
                      onClick={() => {
                        const flopAddress = maker
                          .service('smartContract')
                          .getContractByName('MCD_FLOP').address;
                        giveFlopHope(flopAddress);
                      }}
                      disabled={!web3Connected}
                    >
                      Unlock DAI in the Debt Auction
                    </Button>
                  </Grid>
                }
              />
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
                    'Deposit DAI into the VAT',
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
                          onTxFinished={() => {
                            ReactGA.event({
                              category: 'account',
                              action: 'deposited'
                              // label: maker.currentAddress()
                            });
                            updateDaiBalances();
                          }}
                          small={''}
                          actionText={'Deposit'}
                        />
                      </Box>
                    </Grid>
                  ],
                  [
                    'Withdraw DAI From VAT',
                    <Grid>
                      <Box
                        sx={{
                          bg: 'background',
                          p: 4,
                          borderRadius: 6
                        }}
                      >
                        <MiniFormLayout
                          text={'Withdraw DAI from the VAT'}
                          disabled={false}
                          inputUnit="DAI"
                          onSubmit={exitDaiFromAdapter}
                          onTxFinished={() => {
                            ReactGA.event({
                              category: 'account',
                              action: 'withdraw'
                              // label: maker.currentAddress()
                            });
                            updateDaiBalances();
                          }}
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

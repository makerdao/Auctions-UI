/** @jsx jsx */
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import { Text, jsx, Box, Button, Grid, Card } from 'theme-ui';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from './AccountManagerLayout';
import { formatBalance } from '../utils';
import { AUCTION_DATA_FETCHER, MCD_JOIN_DAI, MCD_FLAP } from '../constants';

const FlapAccountManager = ({ allowances }) => {
  const { maker, web3Connected } = useMaker();
  let { daiBalance, mkrBalance, flapMkrBalance } = useBalances();

  daiBalance = formatBalance(daiBalance);
  mkrBalance = formatBalance(mkrBalance);
  flapMkrBalance = formatBalance(flapMkrBalance);

  const {
    hasDaiJoinDaiAllowance,
    giveDaiJoinDaiAllowance,
    hasMkrFlapAllowance,
    giveMkrFlapAllowance,
    hasHope,
    giveHope
  } = allowances;

  const allowanceMissing =
    !hasDaiJoinDaiAllowance || !hasMkrFlapAllowance || !hasHope[MCD_JOIN_DAI];

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
              transactions below.
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
                type={'MKR in your Wallet'}
                balance={`${mkrBalance} MKR`}
                shouldUnlock={!hasMkrFlapAllowance}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        MKR wallet balance - {mkrBalance}
                      </Text>

                      <Button
                        variant="small"
                        onClick={() => giveMkrFlapAllowance()}
                        disabled={!web3Connected}
                      >
                        {hasMkrFlapAllowance
                          ? 'MKR Unlocked'
                          : 'Unlock MKR for the auction'}
                      </Button>
                    </Grid>
                  </Card>
                }
              />
              <BalanceOf
                type={'Auction Contract Balance'}
                balance={`${flapMkrBalance} MKR`}
                shouldUnlock={!hasHope[MCD_JOIN_DAI]}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        Auction Contract Balance - {flapMkrBalance}
                      </Text>
                      <Button
                        variant="small"
                        onClick={() => {
                          const joinAddress = maker.service(
                            AUCTION_DATA_FETCHER
                          ).joinDaiAdapterAddress;
                          giveHope(joinAddress, MCD_JOIN_DAI);
                        }}
                        disabled={!web3Connected || hasHope[MCD_JOIN_DAI]}
                      >
                        Enable the adapter
                      </Button>
                    </Grid>
                  </Card>
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'muted'
                }}
              />
              <BalanceOf
                type={'DAI in your Wallet'}
                balance={`${daiBalance} DAI`}
                shouldUnlock={!hasDaiJoinDaiAllowance}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">
                        DAI Wallet Balance - {daiBalance}
                      </Text>
                      <Button
                        variant="small"
                        onClick={() => giveDaiJoinDaiAllowance()}
                        disabled={!web3Connected}
                      >
                        {hasDaiJoinDaiAllowance
                          ? 'DAI Unlocked'
                          : 'Unlock DAI for the auction'}
                      </Button>
                    </Grid>
                  </Card>
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'muted'
                }}
              />
              {/* <BalanceOf
                type={'Enable Surplus Auction'}
                balance={`${flapMkrBalance} MKR`}
                shouldUnlock={!hasHope[MCD_FLAP]}
                unlock={
                  <Card>
                    <Grid gap={3}>
                      <Text variant="caps">Enable Surplus Auctions</Text>
                      <Button
                        variant="small"
                        onClick={() => {
                          const flapAddress = maker
                            .service('smartContract')
                            .getContractByName('MCD_FLAP').address;
                          giveHope(flapAddress, MCD_FLAP);
                        }}
                        disabled={!web3Connected}
                      >
                        Enable the Surplus Auction
                      </Button>
                    </Grid>
                  </Card>
                }
              /> */}
            </Grid>
          ) : null}
        </Box>
      }
    />
  );
};

export default FlapAccountManager;

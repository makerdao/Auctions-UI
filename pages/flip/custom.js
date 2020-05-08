/** @jsx jsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import ReactGA from 'react-ga';
import {
  Text,
  jsx,
  Flex,
  Button,
  Heading,
  Spinner,
  Box,
  Input,
  Label,
  Grid,
  Card
} from 'theme-ui';
import useAuctionActions from '../../hooks/useAuctionActions';

import { TX_PENDING, TX_SUCCESS, TX_ERROR } from '../../constants';

import useMaker from '../../hooks/useMaker';
import useSystemStore from '../../stores/systemStore';
import FlipAccountManager from '../../components/FlipAccountManager';
import GuttedLayout from '../../components/GuttedLayout';
import ActionTabs from '../../components/ActionTabs';

const Form = ({ ilk }) => {
  const initialValue = '';
  const [idState, setIdState] = useState(initialValue);
  const [bidState, setBidState] = useState(initialValue);
  const [lotState, setLotState] = useState(initialValue);

  const [txState, setTxState] = useState(undefined);
  const [txMsg, setTxMsg] = useState(undefined);
  const [txErrorMsg, setTxErrorMsg] = useState(undefined);

  const { maker } = useMaker();
  const { callTend } = useAuctionActions();

  const errorMessages = [];
  if (txErrorMsg) {
    errorMessages.push(txErrorMsg);
  }

  const inputsValid = idState && bidState && lotState;
  const disabled =
    !inputsValid || !!errorMessages.length || txState === TX_PENDING;

  const onSubmit = () => {
    const txObject = callTend(idState, lotState, bidState, ilk);
    setTxErrorMsg(undefined);
    maker.service('transactionManager').listen(txObject, {
      initialized: () => {
        setTxState(TX_PENDING);
      },
      pending: tx => {
        setTxState(TX_PENDING);
        setTxMsg(
          'Please wait while the transaction is being mined (this can take a while)'
        );
      },
      mined: tx => {
        setTxState(TX_SUCCESS);
        setTxMsg('Transaction Sucessful!');
        setIdState(undefined);
        setBidState(undefined);
        setLotState(undefined);
      },
      error: (_, err) => {
        const errorMsg = _.error.message.split('\n')[0];
        setTxState(TX_ERROR);
        setTxMsg(null);

        setTxErrorMsg(`Transaction failed with error: ${errorMsg}`);
      }
    });
    return txObject;
  };

  const handleIdChange = event => {
    const value = event.target.value;
    setIdState(value);
  };
  const handleBidChange = event => {
    const value = event.target.value;
    setBidState(BigNumber(value));
  };
  const handleLotChange = event => {
    const value = event.target.value;
    setLotState(BigNumber(value));
  };

  return (
    <Grid>
      <Flex sx={{ flexDirection: 'column' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text>Auction ID</Text>
          <Flex
            sx={{
              maxWidth: ['100%', 7],
              mr: [0, 2],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'muted',
              bg: 'surface',
              borderRadius: 'small',
              fontSize: 3,
              px: 3,
              py: 1
            }}
          >
            <Input
              sx={{
                borderColor: 'transparent',
                p: 0,
                m: 0,
                '&:focus': {
                  borderColor: 'transparent'
                }
              }}
              id="flip-auctionid"
              type="number"
              step="0.01"
              placeholder="0"
              onChange={handleIdChange}
            />
            <Label sx={{ p: 0, width: 'auto' }} htmlFor="flip-auctionid">
              ID
            </Label>
          </Flex>
        </Flex>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text>Lot Size</Text>
          <Flex
            sx={{
              maxWidth: ['100%', 7],
              mr: [0, 2],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'muted',
              bg: 'surface',
              borderRadius: 'small',
              fontSize: 3,
              px: 3,
              py: 1
            }}
          >
            <Input
              sx={{
                borderColor: 'transparent',
                p: 0,
                m: 0,
                '&:focus': {
                  borderColor: 'transparent'
                }
              }}
              id="flip-lotsize"
              type="number"
              step="0.01"
              placeholder="0"
              onChange={handleLotChange}
            />
            <Label sx={{ p: 0, width: 'auto' }} htmlFor="flip-lotsize">
              {ilk.slice(0, -2)}
            </Label>
          </Flex>
        </Flex>
        <Flex sx={{ flexDirection: 'column' }}>
          <Text>Bid Amount</Text>
          <Flex
            sx={{
              maxWidth: ['100%', 7],
              mr: [0, 2],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'muted',
              bg: 'surface',
              borderRadius: 'small',
              fontSize: 3,
              px: 3,
              py: 1
            }}
          >
            <Input
              sx={{
                borderColor: 'transparent',
                p: 0,
                m: 0,
                '&:focus': {
                  borderColor: 'transparent'
                }
              }}
              id="flip-bidamount"
              type="number"
              step="0.01"
              placeholder="0"
              onChange={handleBidChange}
            />
            <Label sx={{ p: 0, width: 'auto' }} htmlFor="flip-bidamount">
              DAI
            </Label>
          </Flex>
        </Flex>
        <Flex
          sx={{
            py: 3
          }}
        >
          <Button
            sx={{}}
            variant="primary"
            disabled={disabled}
            onClick={onSubmit}
          >
            {txState === TX_PENDING ? 'Waiting for Transaction' : 'Submit'}
          </Button>
        </Flex>
      </Flex>
      {/* </Flex> */}
      {!errorMessages
        ? null
        : errorMessages.map((err, i) => (
            <Text key={i} variant="smallDanger">
              {err}
            </Text>
          ))}
      {txMsg ? (
        <Text
          variant="small"
          sx={{
            color: 'primary'
          }}
        >
          {txMsg}
        </Text>
      ) : null}
    </Grid>
  );
};

const CustomAuction = () => {
  return (
    <Card sx={{ my: 3 }}>
      <Grid>
        <ActionTabs
          actions={[
            [
              'ETH Auction',
              <Grid key="ETH">
                <Box
                  sx={{
                    bg: 'background',
                    p: 3,
                    borderRadius: 'medium'
                  }}
                >
                  <Form ilk={'ETH-A'} />
                </Box>
              </Grid>
            ],
            [
              'BAT Auction',
              <Grid key="BAT">
                <Box
                  sx={{
                    bg: 'background',
                    p: 3,
                    borderRadius: 'medium'
                  }}
                >
                  <Form ilk={'BAT-A'} />
                </Box>
              </Grid>
            ]
          ]}
        />
      </Grid>
    </Card>
  );
};

const Index = () => {
  const { maker, web3Connected } = useMaker();
  const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlipFlag = featureFlags.includes('flip-ui');

  useEffect(() => {
    if (window !== undefined) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  if (!hasFlipFlag)
    return (
      <GuttedLayout>
        <>
          <Heading
            variant="h1"
            sx={{
              py: 3
            }}
          >
            Collateral Auctions
            <Text
              variant="caps"
              sx={{
                color: 'warning',
                display: 'inline-block',
                ml: 3
              }}
            >
              BETA{' '}
            </Text>
          </Heading>

          <Text>Coming soon.</Text>
        </>
      </GuttedLayout>
    );

  return (
    <GuttedLayout>
      <Head>
        <title>Maker Auctions (Beta)</title>
      </Head>

      {!maker ? (
        <Flex
          sx={{
            justifyContent: 'center',
            p: 3
          }}
        >
          <Spinner />
        </Flex>
      ) : (
        <>
          <Heading
            variant="h2"
            sx={{
              py: 3
            }}
          >
            Collateral Auctions By ID
          </Heading>

          <FlipAccountManager web3Connected={web3Connected} />
          {!web3Connected ? null : <CustomAuction />}
        </>
      )}
    </GuttedLayout>
  );
};

export default Index;

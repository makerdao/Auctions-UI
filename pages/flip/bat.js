/** @jsx jsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import Moment from 'react-moment';
import ReactGA from 'react-ga';
import { Text, jsx, Flex, Button, Heading, Spinner } from 'theme-ui';

import { AUCTION_DATA_FETCHER } from '../../constants';

import useMaker from '../../hooks/useMaker';
import useBalances from '../../hooks/useBalances';
import useAllowances from '../../hooks/useAllowances';

import useAuctionsStore, { selectors } from '../../stores/auctionsStore';
import useSystemStore from '../../stores/systemStore';

import FlipAccountManager from '../../components/FlipAccountManager';
import GuttedLayout from '../../components/GuttedLayout';
import AuctionsLayout from '../../components/AuctionsLayout';
import NoAuctions from '../../components/NoAuctions';

const Index = () => {
  const { maker, web3Connected } = useMaker();
  const auctions = useAuctionsStore(state => state.auctions);
  const fetchAuctions = useAuctionsStore(state => state.fetchAll);
  const fetchAuctionsSet = useAuctionsStore(state => state.fetchSet);
  const fetchFlopStepSize = useAuctionsStore(state => state.fetchFlopStepSize);
  const stepSize = useAuctionsStore(state => state.flopStepSize);
  const [TOCAccepted, setTOCAccepted] = useState(false);
  const allowances = useAllowances();
  const [{ isSyncing, lastSynced }, sync] = useState({});
  const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlipFlag = featureFlags.includes('flip-ui');

  useEffect(() => {
    if (window !== undefined) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (web3Connected) {
      if (!auctions) {
        fetchAuctions(maker);
        fetchFlopStepSize(maker);
      }
    }
  }, [web3Connected]);

  useEffect(() => {
    if (isSyncing) {
      sync({
        lastSynced,
        isSyncing: false
      });
    }
  }, [auctions]);

  if (!hasFlipFlag)
    return (
      <GuttedLayout>
        <>
          <Heading
            variant="h2"
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
            BAT Collateral Auctions
          </Heading>

          <FlipAccountManager web3Connected={web3Connected} />
          {!web3Connected ? null : (
            <Flex
              sx={{
                py: 3,
                pt: 4,
                alignItems: 'center'
              }}
            >
              <Text variant="h2">Active Auctions</Text>
              <Button
                variant="small"
                sx={{ ml: 3 }}
                disabled={!web3Connected}
                onClick={() => fetchAuctions(true)}
              >
                Sync
              </Button>
              {lastSynced && (
                <Text title={lastSynced} sx={{ ml: 3, fontSize: 2 }}>
                  (Last synced: <Moment local>{lastSynced.getTime()}</Moment>)
                </Text>
              )}
            </Flex>
          )}
          {!web3Connected ? null : !auctions ? (
            <Flex
              sx={{
                justifyContent: 'center'
              }}
            >
              <Spinner />
            </Flex>
          ) : !Object.keys(auctions).length ? (
            <NoAuctions />
          ) : (
            // <AuctionsLayout auctions={auctions} type="flip" />

            <AuctionsLayout
              allowances={allowances}
              stepSize={stepSize}
              auctions={auctions}
              type="flip"
            />
          )}
        </>
      )}
    </GuttedLayout>
  );
};

export default Index;

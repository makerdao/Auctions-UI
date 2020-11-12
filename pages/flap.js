/** @jsx jsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import * as _ from 'lodash';
import { Text, jsx, Flex, Heading, Box, Spinner, Button } from 'theme-ui';
import AccountManager from '../components/FlapAccountManager';
import GuttedLayout from '../components/GuttedLayout';
import AuctionsLayout from '../components/AuctionsLayout';
import Footer from '../components/Footer';
import NoAuctions from '../components/NoAuctions';
import useAllowances from '../hooks/useAllowances';
import Moment from 'react-moment';
import useAuctionsStore from '../stores/auctionsStore';
import ReactGA from 'react-ga';
import IntroInfoCard from '../components/IntroInfoCard';
import IntroMDX from '../text/flapIntro.mdx';
import TermsConfirm from '../components/TermsConfirm';

const Index = () => {
  const { maker, web3Connected } = useMaker();
  const auctions = useAuctionsStore(state => state.flapAuctions);
  const fetchAuctions = useAuctionsStore(state => state.fetchAllFlap);
  const fetchFlapStepSize = useAuctionsStore(state => state.fetchFlapStepSize);
  const stepSize = useAuctionsStore(state => state.flapStepSize);
  const [TOCAccepted, setTOCAccepted] = useState(false);
  const allowances = useAllowances();
  const [{ isSyncing, lastSynced }, sync] = useState({});
  // const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlag = true;

  useEffect(() => {
    if (window !== undefined) {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  // Fetch auctions & step size
  useEffect(() => {
    if (web3Connected) {
      if (!auctions) {
        fetchAuctions(maker);
        fetchFlapStepSize(maker);
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

  return (
    <GuttedLayout>
      <Head>
        <title>Surplus Auctions (Beta) - Maker Auctions</title>
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
              py: 4
            }}
          >
            Surplus Auctions
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
          <IntroInfoCard
            title={'How do surplus auctions work?'}
            text={<IntroMDX />}
            forceExpanded={!TOCAccepted}
            action={
              TOCAccepted ? null : (
                <TermsConfirm
                  onConfirm={() => {
                    setTOCAccepted(true);
                  }}
                />
              )
            }
          />
          <Box
            sx={{
              opacity: TOCAccepted ? 1 : 0.2,
              pointerEvents: TOCAccepted ? 'auto' : 'none'
            }}
          >
            <AccountManager allowances={allowances} />

            {!web3Connected ? null : (
              <Flex
                sx={{
                  py: 3,
                  pt: 4,
                  alignItems: 'center'
                }}
              >
                <Text variant="h2">Active Auctions</Text>
                {isSyncing ? (
                  <Spinner
                    sx={{
                      height: 4,
                      ml: 3
                    }}
                  />
                ) : (
                  <Button
                    variant="small"
                    sx={{ ml: 3 }}
                    disabled={!web3Connected}
                    onClick={() => {
                      sync({ isSyncing: true, lastSynced: new Date() });
                      fetchAuctions(maker);
                    }}
                  >
                    Sync
                  </Button>
                )}

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
              <AuctionsLayout
                allowances={allowances}
                stepSize={stepSize}
                auctions={auctions}
                type="flap"
              />
            )}
          </Box>
        </>
      )}
      <Footer />
    </GuttedLayout>
  );
};

export default Index;

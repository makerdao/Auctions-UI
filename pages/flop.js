/** @jsx jsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import useMaker from '../hooks/useMaker';
import * as _ from 'lodash';
import { Text, jsx, Flex, Heading, Box, Spinner, Button } from 'theme-ui';
import AccountManager from '../components/FlopAccountManager';
import GuttedLayout from '../components/GuttedLayout';
import AuctionsLayout from '../components/AuctionsLayout';
import IntroInfoCard from '../components/IntroInfoCard';
import IntroMDX from '../text/flopIntro.mdx';
import Footer from '../components/Footer';
import TermsConfirm from '../components/TermsConfirm';
import NoAuctions from '../components/NoAuctions';
import useAllowances from '../hooks/useAllowances';
import Moment from 'react-moment';
import useAuctionsStore from '../stores/auctionsStore';
import ReactGA from 'react-ga';
import useSystemStore from '../stores/systemStore';

const Index = () => {
  const { maker, web3Connected } = useMaker();
  const auctions = useAuctionsStore(state => state.auctions);
  const fetchAuctions = useAuctionsStore(state => state.fetchAll);
  const fetchFlopStepSize = useAuctionsStore(state => state.fetchFlopStepSize);
  const stepSize = useAuctionsStore(state => state.flopStepSize);
  const [TOCAccepted, setTOCAccepted] = useState(false);
  const allowances = useAllowances();
  const [{ isSyncing, lastSynced }, sync] = useState({});
  const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlag = true;

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

  useEffect(() => {}, [auctions]);
  useEffect(() => {
    if (isSyncing) {
      sync({
        lastSynced,
        isSyncing: false
      });
    }
  }, [auctions]);

  if (!hasFlag)
    return (
      <GuttedLayout>
        <>
          <Heading
            variant="h1"
            sx={{
              py: 4
            }}
          >
            Debt Auctions
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
        <title>Debt Auctions (Beta) - Maker Auctions</title>
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
            Debt Auctions
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
            title={'How do debt auctions work?'}
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
                type="flop"
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

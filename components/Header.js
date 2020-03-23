/** @jsx jsx */
import { useState, useEffect } from 'react';

import { Heading, Text, jsx, Button, NavLink, Box, Flex } from 'theme-ui';
import Link from 'next/link';
import useMaker from '../hooks/useMaker';
import GuttedLayout from './GuttedLayout';
import Logo from './Logo';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga';
import useSystemStore from '../stores/systemStore';

export default () => {
  const { maker, network, web3Connected, setWeb3Connected } = useMaker();
  const { pathname } = useRouter();
  const [showOtherUIs, setShow] = useState(false);
  const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlag = true;
  const hasFlipFlag = featureFlags.includes('flip-ui');
  
  useEffect(() => {
    if (window) {
      setShow(window.location.search.includes('show-test-ui'));
    }
  }, []);

  async function connectBrowserWallet() {
    try {
      if (maker) {
        const { networkName } = maker.service('web3');
        if (network === 'mainnet' && networkName !== 'mainnet')
          window.alert(
            `Please connect your wallet to mainnet to use this app. Or, if you'd like to try this app on the Kovan test network, add ?network=kovan to the end of the URL.`
          );

        setWeb3Connected(true);
        ReactGA.event({
          category: 'account',
          action: 'connected',
          label: maker.currentAddress()
        });
      }
    } catch (err) {
      window.alert(
        'There was a problem connecting to your wallet, please reload and try again.'
      );
    }
  }

  const autoConnect = async () => {
    if (!web3Connected) {
      connectBrowserWallet();
    }
  };

  // autoConnect();

  const formatAccountAddress = address =>
    address.slice(0, 7) + '...' + address.slice(-4);

  return (
    <GuttedLayout>
      <Flex
        sx={{
          py: 3,
          justifyContent: ['center', 'flex-start'],
          flexWrap: ['wrap', 'nowrap']
        }}
      >
        <Link href="/">
          <Flex
            sx={{
              mr: 'auto',
              alignItems: 'center',
              py: 2
            }}
          >
            <Logo />
          </Flex>
        </Link>
        {!hasFlag ? null :
        <>
        <Flex
          as="nav"
          sx={{
            ml: [0, 'auto'],
            mr: [null, 6]
          }}
        >
          {!hasFlipFlag ? null : (
            <Link href="/flip">
              <NavLink
                sx={{
                  fontWeight: pathname === '/flip' ? 'bold' : 'normal',
                  cursor: 'default',
                  p: 2,
                  px: [4, 6]
                }}
              >
                Collateral auctions
              </NavLink>
            </Link>
          )}
          <Link href="/flop">
            <NavLink
              p={2}
              sx={{
                fontWeight: pathname === '/flop' ? 500 : 'normal',
                // color: pathname === '/flop' ? 'primary' : 'body',
                cursor: 'default',
                px: [4, 6]
              }}
            >
              Debt auctions
            </NavLink>
          </Link>
        </Flex>
        <Flex
          sx={{
            mt: [2, 0],
            width: ['100%', 'auto'],
            justifyContent: ['center', '']
          }}
        >
          {!web3Connected ? (
            <Button
              variant="primary"
              disabled={!maker}
              onClick={connectBrowserWallet}
              sx={{
                width: ['100%', 'auto']
              }}
            >
              Connect Wallet
            </Button>
          ) : (
            <Flex
              sx={{
                p: 2,
                bg: 'white',
                px: 4,
                py: 3,
                fontSize: 2,
                lineHeight: '20px',
                width: '296px',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'border',
                borderRadius: 4,
                color: 'blackThree'
              }}
            >
              <Flex
                sx={{
                  flex: '1 1 auto'
                }}
              >
                <span
                  sx={{
                    color:
                      network === 'mainnet' ? 'primary' : 'rgb(144, 85, 175)',
                    marginRight: 2
                  }}
                >
                  ●
                </span>
                <Text>Metamask</Text>
              </Flex>
              <Text>{formatAccountAddress(maker.currentAddress())}</Text>
            </Flex>
          )}
        </Flex>
        </>
}
      </Flex>
    </GuttedLayout>
  );
};

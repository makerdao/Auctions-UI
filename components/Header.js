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
import { formatAddress } from '../utils';

const Header = () => {
  const { maker, network, web3Connected, setWeb3Connected } = useMaker();
  const { pathname } = useRouter();
  const [showOtherUIs, setShow] = useState(false);
  const featureFlags = useSystemStore(state => state.featureFlags);
  const hasFlag = true;
  const hasFlipFlag = featureFlags.includes('flip-ui');
  // const hasSubNav = pathname.includes('/flip/');

  useEffect(() => {
    if (window) {
      setShow(window.location.search.includes('show-test-ui'));
    }
  }, []);

  async function connectBrowserWallet() {
    try {
      if (maker) {
        await maker.authenticate();
        const { networkName } = maker.service('web3');
        if (network === 'mainnet' && networkName !== 'mainnet')
          window.alert(
            "Please connect your wallet to mainnet to use this app. Or, if you'd like to try this app on the Kovan test network, add ?network=kovan to the end of the URL."
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
        {!hasFlag ? null : (
          <>
            <Flex
              as="nav"
              sx={{
                ml: [0, 'auto'],
                mr: [null, 3]
              }}
            >
              {!hasFlipFlag ? null : (
                <Link href="/flip/eth">
                  <NavLink
                    sx={{
                      fontWeight: pathname === '/flip/eth' ? 'bold' : 'normal',
                      cursor: 'default',
                      p: 2,
                      px: [3, 4]
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
                    px: [3, 4]
                  }}
                >
                  Debt auctions
                </NavLink>
              </Link>
{/* 
              <Link href="/flap">
                <NavLink
                  p={2}
                  sx={{
                    fontWeight: pathname === '/flap' ? 500 : 'normal',
                    cursor: 'default',
                    px: [3, 4]
                  }}
                >
                  Surplus auctions
                </NavLink>
              </Link>
*/}
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
                    bg: 'surface',
                    px: 3,
                    py: 2,
                    fontSize: 2,
                    alignItems: 'center',
                    width: 7,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: 'muted',
                    borderRadius: 'small',
                    color: 'text'
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
                          network === 'mainnet' ? 'primary' : 'accentPurple',
                        marginRight: 2
                      }}
                    >
                      ●
                    </span>
                    <Text>Metamask</Text>
                  </Flex>
                  <Text>{formatAddress(maker.currentAddress())}</Text>
                </Flex>
              )}
            </Flex>
          </>
        )}
      </Flex>
      {/* {!hasSubNav ? null : (
        <Flex>
          <Flex
            as="nav"
            sx={{
              ml: [0, 'auto'],
              mr: [null, 4]
            }}
          >
            <Link href="/flip/eth">
              <NavLink
                sx={{
                  fontWeight: pathname === '/flip/eth' ? 500 : 'normal',
                  cursor: 'default',
                  p: 2,
                  px: [3, 4]
                }}
              >
                ETH Collateral
              </NavLink>
            </Link>

            <Link href="/flip/bat">
              <NavLink
                sx={{
                  fontWeight: pathname === '/flip/bat' ? 500 : 'normal',
                  cursor: 'default',
                  p: 2,
                  px: [3, 4]
                }}
              >
                BAT Collateral
              </NavLink>
            </Link>
          </Flex>
        </Flex>
      )} */}
    </GuttedLayout>
  );
};

export default Header;

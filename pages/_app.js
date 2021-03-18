import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import MakerProvider from '../providers/MakerProvider';
import { ThemeProvider, Styled, Box } from 'theme-ui';
import theme from '../theme';
import Header from '../components/Header';
import CookieNotice from '../components/CookieNotice';
import ReactGA from 'react-ga';
import { sysAPI } from '../stores/systemStore';
import { updateState } from '../stores/auctionsStore';

class MyApp extends App {
  state = {
    network: ''
  };

  componentDidMount() {
    const setFeatureFlag = sysAPI.getState().setFeatureFlag;

    this.setState({
      network: window.location.search.includes('kovan')
        ? 'kovan'
        : window.location.search.includes('testchain')
        ? 'testchain'
        : 'mainnet'
    });

    if (window !== undefined) {
      ReactGA.initialize('UA-65766767-8');

      if (window.location.search.includes('show-flip-ui')) {
        setFeatureFlag('flip-ui');
      }
      const searchQuery = new URL(window.location.href).searchParams;

      if (searchQuery) {
        const auctionId = searchQuery.get('auctionId');
        updateState.getState().setFilterByIdValue(auctionId);
      }
      // ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    const { network } = this.state;
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <meta
            httpEquiv="Content-Security-Policy"
            content={
              "default-src 'none';" +
              'frame-src https://connect.trezor.io;' +
              "font-src 'self';" +
              "connect-src 'self' https: wss:;" +
              "style-src 'self' 'unsafe-inline';" +
              `script-src 'self' ${
                process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''
              };` +
              "img-src 'self' https: data:"
            }
          />
          <meta
            name="description"
            content="MakerDAO stakeholders use the Voting Portal to vote on the blockchain. Voting occurs frequently, requiring an active, well-informed governance community."
          />
        </Head>
        <Styled.root>
          <MakerProvider network={network}>
            <Header />
            <Box pt={3}>
              <Component {...pageProps} />
            </Box>
            <CookieNotice />
          </MakerProvider>
        </Styled.root>
      </ThemeProvider>
    );
  }
}

export default MyApp;

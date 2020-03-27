/** @jsx jsx */
import React from 'react';
import Head from 'next/head';
import PrivacyMDX from '../text/privacy.mdx';
import { Heading, jsx, Box } from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';

const Index = () => {
  return (
    <GuttedLayout maxWidth="970px">
      <Box
        sx={{
          pb: 5
        }}
      >
        <Head>
          <title>Privacy Policy</title>
        </Head>
        <Heading variant="h1" py="7">
          Privacy Policy
        </Heading>

        <Box
          sx={{
            variant: 'styles.roundedCard',
            px: 6,
            py: 4
          }}
        >
          <PrivacyMDX />
        </Box>
      </Box>
    </GuttedLayout>
  );
};

export default Index;

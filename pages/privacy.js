/** @jsx jsx */
import React from 'react';
import Head from 'next/head';
import PrivacyMDX from '../text/privacy.mdx';
import { Heading, jsx, Box, Card } from 'theme-ui';
import GuttedLayout from '../components/GuttedLayout';

const Index = () => {
  return (
    <GuttedLayout maxWidth="970px">
      <Box
        sx={{
          pb: 3
        }}
      >
        <Head>
          <title>Privacy Policy</title>
        </Head>
        <Heading variant="h2" py="5">
          Privacy Policy
        </Heading>

        <Card
          sx={{
            px: 3,
            py: 3
          }}
        >
          <PrivacyMDX />
        </Card>
      </Box>
    </GuttedLayout>
  );
};

export default Index;

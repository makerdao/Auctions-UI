/** @jsx jsx */

import React, { useState } from 'react';
import {
  Heading,
  Text,
  jsx,
  Button,
  Grid,
  Box,
  Styled,
  Label,
  Input,
  Flex,
  NavLink,
  Link as ExternalLink
} from 'theme-ui';
import Link from 'next/link';

import getConfig from 'next/config'

const hash = getConfig().publicRuntimeConfig.buildInfo.hash;

const Footer = () => {
  return (
    <Flex
      as="nav"
      sx={{
        ml: [0, 'auto'],
        width: '100%',
        py: 6,
        justifyContent: 'flex-end'
        // mr: [null, 6]
      }}
    >
      <Text p={2}
        variant="footer"
        sx={{
          pr: 0,
        }}>
        Deployed from:
        <ExternalLink href={`https://github.com/makerdao/auctions-ui/commit/${hash}`} target="_blank">
          {' '} {hash}
        </ExternalLink>
      </Text>
      <ExternalLink href="https://chat.makerdao.com/channel/help" target="_blank">
        <NavLink
          p={2}
          variant="footer"
          sx={{
            // px: [4, 6],
            ml: [0, 6],
            pr: 0
          }}
        >
          Chat
        </NavLink>
      </ExternalLink>

      <Link href="/terms">
        <NavLink
          p={2}
          variant="footer"
          sx={{
            // px: [4, 6],
            ml: [0, 6],
            pr: 0
          }}
        >
          Terms of Service
        </NavLink>
      </Link>
      <Link href="/faq">
        <NavLink
          p={2}
          variant="footer"
          sx={{
            // px: [4, 6],
            ml: [0, 6],
            pr: 0
          }}
        >
          FAQ
        </NavLink>
      </Link>
    </Flex>
  );
};

export default Footer;

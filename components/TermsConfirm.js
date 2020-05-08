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
  Checkbox,
  Flex,
  NavLink,
  Link as SLink
} from 'theme-ui';
import Link from 'next/link';

const TermsConfirm = ({ onConfirm, confirmed }) => {
  const _onConfirm = () => {
    onConfirm();
  };
  return (
    <Box
      sx={{
        p: 3,
        pt: 0
      }}
    >
      <Box
        sx={{
          p: 3,
          bg: 'background',
          borderRadius: 'medium'
        }}
      >
        <Text variant="boldBody" pb="2">
          Please accept the Terms of Service before bidding.
        </Text>
        <Flex
          sx={{
            alignItems: 'center'
          }}
        >
          <Label>
            <Box
              onClick={_onConfirm}
              sx={{
                mr: 1
              }}
            >
              <Checkbox
                as="input"
                defualtChecked={confirmed}
                onChange={_onConfirm}
              />
            </Box>

            <Text variant="inputText">
              I have read and accept these{' '}
              <Link
                href="/terms"
                // variant="clean"
              >
                <SLink
                  sx={{
                    variant: 'styles.a',
                    display: 'inline'
                  }}
                >
                  Terms of Service
                </SLink>
              </Link>
              .
            </Text>
          </Label>
        </Flex>
      </Box>
    </Box>
  );
};

export default TermsConfirm;

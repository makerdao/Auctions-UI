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
  NavLink
} from 'theme-ui';
import Link from 'next/link';
import UpSVG from '../assets/chevron_up.svg';
import DownSVG from '../assets/chevron_down.svg';

const CollapseToggle = ({ active, onClick }) => {
  return (
    <Button
      sx={{
        bg: 'surface',
        '&:hover': {
          bg: 'surface'
        },
        '&:active': {
          bg: 'surface'
        }
      }}
      onClick={onClick}
    >
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {active ? <UpSVG /> : <DownSVG />}
      </Flex>
    </Button>
  );
};

export default CollapseToggle;

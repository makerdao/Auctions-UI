/** @jsx jsx */

import React, { useState } from 'react';
import {
  Heading,
  Text,
  jsx,
  Button,
  Grid,
  Box,
  Card,
  Styled,
  Label,
  Input,
  Flex
} from 'theme-ui';
import CollapseToggle from './CollapseToggle';

const IntroInfoCard = ({
  title,
  text,
  action,
  forceExpanded,
  collapsed: isCollapsed
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed || false);
  return (
    <Card p={0}>
      <Flex
        sx={{
          p: 3,
          borderBottom: collapsed ? null : '1px solid',
          borderColor: 'muted',
          alignItems: 'center'
        }}
      >
        <Heading variant="h3">{title}</Heading>
        <Box
          sx={{
            ml: 'auto'
          }}
        >
          <CollapseToggle
            onClick={() => (forceExpanded ? null : setCollapsed(!collapsed))}
            active={!collapsed}
          />
        </Box>
      </Flex>
      {collapsed ? null : (
        <>
          <Box px="3" pb="3">
            {text}
          </Box>
          {action}
        </>
      )}
    </Card>
  );
};

export default IntroInfoCard;

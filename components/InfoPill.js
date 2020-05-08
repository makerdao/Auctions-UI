/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import { Text, jsx, Grid, Box } from 'theme-ui';

const InfoPill = ({ bg = 'primary', color = 'surface', sx, children }) => {
  return (
    <Box
      sx={{
        py: 1,
        px: 3,
        borderRadius: 'roundish',
        bg,
        ...sx
      }}
    >
      <Text
        variant="caps"
        sx={{
          color
        }}
      >
        {children}
      </Text>
    </Box>
  );
};

export default InfoPill;

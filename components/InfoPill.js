/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import { Text, jsx, Grid, Box } from 'theme-ui';

const InfoPill = ({ bg = 'primary', color = 'primaryContrast', sx, children }) => {
  return (
    <Box
      sx={{
        py: 1,
        px: 4,
        borderRadius: 12,
        bg,
        ...sx
      }}
    >
      <Text variant="caps" sx={{
        color
      }}>{children}</Text>
    </Box>
  );
};


export default InfoPill;

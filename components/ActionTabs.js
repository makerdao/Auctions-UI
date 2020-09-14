/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import {
  Heading,
  Text,
  jsx,
  Box,
  Button,
  Grid,
  Styled,
  Input,
  Flex
} from 'theme-ui';

const ActionTabs = ({ actions }) => {
  const f = actions.filter(Boolean);
  const tabs = f.map(a => a[0]);
  const contents = f.map(a => a[1]);
  const active = f.map(a => a[2]).indexOf(true);
  const [activeTabIndex, setActive] = useState(active >= 0 ? active : null);

  return (
    <Grid>
      <Flex>
        {tabs.map((t, i) => (
          <Button
            key={`${t}-${i}`}
            disabled={f[i][3]}
            variant={i !== activeTabIndex ? 'smallOutline' : 'small'}
            sx={{
              mr: 2
            }}
            onClick={() => {
              if (i === activeTabIndex) {
                setActive(null);
                return;
              }
              setActive(i);
            }}
          >
            {t}
          </Button>
        ))}
      </Flex>

      {activeTabIndex >= 0 &&
      activeTabIndex < contents.length &&
      contents[activeTabIndex] ? (
        <Box>{contents[activeTabIndex]}</Box>
      ) : null}
    </Grid>
  );
};

export default ActionTabs;

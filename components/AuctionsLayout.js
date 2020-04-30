import React, { useState, useEffect } from 'react';
import FlipAuctionBlock from './FlipAuctionBlock';
import FlopAuctionBlock from './FlopAuctionBlock';
import { Button, Grid, Input, Flex, Select } from 'theme-ui';
import useAuctionsStore, { selectors } from '../stores/auctionsStore';
import useSystemStore from '../stores/systemStore';
import AuctionFilters from './AuctionFilters';
import useMaker from '../hooks/useMaker';
import { REFETCH_BLOCK_INTERVAL } from '../constants';

const AuctionsLayout = ({ auctions, allowances, stepSize, type }) => {
  // const { blockHeight } = useMaker();
  const { hasPrevPageSelector, hasNextPageSelector } = selectors;
  const blockHeight = useSystemStore(state => state.blockHeight);
  const [localBlockHeight, setLocalBlockHeight] = useState(0);
  const next = useAuctionsStore(state => state.nextPage);
  const prev = useAuctionsStore(state => state.prevPage);
  const fetchAuctionsSet = useAuctionsStore(state => state.fetchSet);

  const filteredAuctions = useAuctionsStore(selectors.filteredAuctions());
  const auctionsPage = useAuctionsStore(
    selectors.auctionsPage(filteredAuctions)
  );

  useEffect(() => {
    if (auctionsPage.length && blockHeight && blockHeight > localBlockHeight) {
      if (blockHeight - localBlockHeight > REFETCH_BLOCK_INTERVAL) {
        console.log('block based set fetch', blockHeight, 'lastBlockFetch', localBlockHeight);
        const ids = auctionsPage.map(a => a.auctionId);
        fetchAuctionsSet(ids);
        setLocalBlockHeight(blockHeight);
      }
    }
  }, [blockHeight, localBlockHeight]);

  const hasPrev = useAuctionsStore(hasPrevPageSelector());
  const hasNext = useAuctionsStore(hasNextPageSelector(filteredAuctions));
  const AuctionBlockLayout =
    type === 'flip' ? FlipAuctionBlock : FlopAuctionBlock;

  return (
    <>
      <AuctionFilters/>
      <Grid gap={3}>
        {auctionsPage.map(({ events, end, tic, auctionId }) => {
          return (
            <AuctionBlockLayout
              allowances={allowances}
              stepSize={stepSize}
              key={auctionId}
              events={events}
              id={auctionId}
              end={end}
              tic={tic}
            />
          );
        })}
      </Grid>
      <Flex
        sx={{
          justifyContent: 'center',
          mt: 3,
          mb: 3
        }}
      >
        <Button
          variant="primary"
          sx={{ mr: 3 }}
          disabled={!hasPrev}
          onClick={prev}
        >
          Prev
        </Button>
        <Button variant="primary" disabled={!hasNext} onClick={next}>
          Next
        </Button>
      </Flex>
    </>
  );
};

export default AuctionsLayout;

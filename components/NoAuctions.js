import { Flex, Box, Text } from 'theme-ui';
import { MakerCircleLogo } from './Logo';

export default () => (
  <Flex sx={{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: ' center',
    mt: 3,
    mb: 3
  }}>
    <MakerCircleLogo />
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      <Text variant="muted">
        {/* Calculate past <some period> based on the CUT_OFF_PERIOD constant */}
        There hasn't been any auctions in the past 15 days.
      </Text>
      <Text variant="muted">
        Please check back later.
      </Text>
    </Box>
  </Flex>
);
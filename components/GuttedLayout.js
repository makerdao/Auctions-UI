import { Heading, Text, jsx, Box, Button, Styled, Input, Flex } from 'theme-ui';
import CookieNotice from './CookieNotice';

export default ({ children, maxWidth = '1140px' }) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          px: 5,
          width: maxWidth
        }}
      >
        {children}
        <CookieNotice />
      </Box>
    </Flex>
  );
};

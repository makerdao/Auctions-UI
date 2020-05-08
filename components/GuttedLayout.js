import { Heading, Text, jsx, Box, Button, Styled, Input, Flex } from 'theme-ui';

export default ({ children, maxWidth = '1140px' }) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          px: 3,
          width: maxWidth
        }}
      >
        {children}
      </Box>
    </Flex>
  );
};

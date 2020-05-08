import React, { useState, useEffect } from 'react';
import { Text, Card, Button, Flex, Link as SLink } from 'theme-ui';
import Cross from '../assets/cross.svg';
import Link from 'next/link';

const CookieNotice = () => {
  const PRIVACY_ACCEPTED_DATE = 'makerdao_auctions_privacy_accepted_date';
  const [show, setShow] = useState(false);
  useEffect(() => {
    const acceptedDate = window.localStorage.getItem(PRIVACY_ACCEPTED_DATE);
    if (!acceptedDate) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    try {
      window.localStorage.setItem(
        PRIVACY_ACCEPTED_DATE,
        new Date().toISOString()
      );
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `localStorage setItem failed: ${message}`;
      console.error(errMsg);
    }
    setShow(false);
  };
  return show ? (
    <Flex
      sx={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        justifyContent: 'center',
        position: 'fixed',
        p: 3
      }}
    >
      <Card
        sx={{
          py: 2,
          boxShadow: '0 1px 2px rgba(90, 90, 90, 0.06)',
          borderRadius: 'round'
        }}
      >
        <Flex>
          <Text
            sx={{
              mr: 2,
              variant: 'text.inputText',
              fontSize: 2
            }}
          >
            By using this website you agree to our{' '}
            <Link href="/privacy">
              <SLink
                sx={{
                  variant: 'styles.a',
                  display: 'inline',
                  cursor: 'pointer'
                }}
              >
                privacy policy
              </SLink>
            </Link>
          </Text>
          <Button
            sx={{ cursor: 'pointer' }}
            variant="clear"
            onClick={handleClose}
          >
            <Flex
              sx={{
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Cross />
            </Flex>
          </Button>
        </Flex>
      </Card>
    </Flex>
  ) : null;
};

export default CookieNotice;

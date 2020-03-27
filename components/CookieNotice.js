import React, { useState, useEffect } from 'react';
import { Text, Flex, Link } from 'theme-ui';
import { ReactComponent as Cross } from '../assets/cross.svg';

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
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #d4d9e1',
        boxSizing: 'border-box',
        boxShadow: '0 1px 2px rgba(90, 90, 90, 0.06)',
        borderRadius: 24,
        textAlign: 'left',
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '3000',
        padding: '8px 18px 10px',
        whiteSpace: 'no-wrap',

        '@media (max-width: 415px)': {
          bottom: '0',
          borderRadius: 'unset',
          whiteSpace: 'normal',
          width: '100%'
        }
      }}
    >
      <Text sx={{ fontSize: '14px', color: '#231536', flexShrink: 1, mr: 2 }}>
        By using this website you agree to our <Link>privacy policy</Link>
      </Text>
      <Cross sx={{ width: '10px', cursor: 'pointer' }} onClick={handleClose} />
    </Flex>
  ) : null;
};

export default CookieNotice;

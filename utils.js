import { balanceRounding, ZERO } from './constants';

export const getValueOrDefault = (value, def = '-') => {
  return value ? value : def;
};

export const formatBalance = value => {
  if (typeof value === 'string') value = parseFloat(value);
  if (value === 0) return '0.000';
  if (!value) return;
  if (value < 1)
    return value.toLocaleString(undefined, {
      minimumFractionDigits: balanceRounding.zeroToOne,
      maximumFractionDigits: balanceRounding.zeroToOne
    });
  else if (value > 1 && value < 10000)
    return value.toLocaleString(undefined, {
      minimumFractionDigits: balanceRounding.oneTo10K,
      maximumFractionDigits: balanceRounding.oneTo10K
    });
  else
    return value.toLocaleString(undefined, {
      minimumFractionDigits: balanceRounding.over10K,
      maximumFractionDigits: balanceRounding.over10K
    });
};

export const isValidAddressString = addressString =>
  /^0x([A-Fa-f0-9]{40})$/.test(addressString);

export const isValidTxString = txString =>
  /^0x([A-Fa-f0-9]{64})$/.test(txString);

export const etherscanLink = (string, network = 'mainnet') => {
  const pathPrefix = network === 'mainnet' ? '' : `${network}.`;
  if (isValidAddressString(string))
    return `https://${pathPrefix}etherscan.io/address/${string}`;
  else if (isValidTxString(string))
    return `https://${pathPrefix}etherscan.io/tx/${string}`;
  else throw new Error(`Can't create Etherscan link for "${string}"`);
};

export const getBlockNumber = async rpcUrl => {
  const rawResponse = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      id: 1
    })
  });

  const { result } = await rawResponse.json();
  if (!result) throw new Error('Failed to fetch block number');
  return parseInt(result, 16);
};

export const formatAddress = address =>
  address.slice(0, 7) + '...' + address.slice(-4);

export const gemFromIlk = ilk => ilk.split('-')[0];

require('dotenv').config();

const withMDX = require('@next/mdx')();

module.exports = withMDX({
  // assetPrefix: './',
  // exportTrailingSlash: true,

  env: {
    IPFS: process.env.IPFS,
    INFURA_KEY: 'da1c15fe072d4617b5808ea623df4660'
  }
});

require('dotenv').config();

const pkg = require('./package.json');
const execa = require('execa');

const gitHash = execa.sync('git', ['rev-parse', '--short', 'HEAD']).stdout;
const gitNumCommits = Number(execa.sync('git', ['rev-list', 'HEAD', '--count']).stdout);
const gitDirty = execa.sync('git', ['status', '-s', '-uall']).stdout.length > 0;
const branch = execa.sync('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout;

const withMDX = require('@next/mdx')();

module.exports = withMDX({
  // assetPrefix: './',
  // exportTrailingSlash: true,
  publicRuntimeConfig: {
    buildInfo: {
     branch: branch,
     date: Date.now(),
     dirty: gitDirty,
     hash: gitHash,
     name: pkg.name,
     commits: gitNumCommits,
     version: pkg.version,
    }
  },
  env: {
    IPFS: process.env.IPFS,
    INFURA_KEY: '6ba7a95268bf4ccda9bf1373fe582b43'
  }
});

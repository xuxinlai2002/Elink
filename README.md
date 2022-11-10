<h1 align="center">ELINK</h1>
<p align="center">ERC20 Withdraw is to withdraw assets transferred from other chains to the ESC chain to the project on the original chain. </p>
<div align="center">

[![License: GPL v3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![type-badge](https://img.shields.io/badge/build-solidity-green)](https://img.shields.io/badge/build-solidity-green)
</div>

## Dependencies
Make sure you're running a version of node compliant with the `engines` requirement in `package.json`, or install Node Version Manager [`nvm`](https://github.com/creationix/nvm) and run `nvm use` to use the correct version of node.

Requires `nodejs` ,`yarn` and `npm`.

```shell
# node -v 
v16.0.0
# yarn version
yarn version v1.22.17 
# npm -v
8.5.3
```

## Quick Start
```shell
# Development library installation
yarn install
npm install dotenv 

# contract compilation
yarn compile

# contract unit test
## run all tests
yarn test
## run certain test file
yarn test test/withdrawTx.test.js   
```
> Make sure you are using the original npm registry.  
> `npm config set registry http://registry.npmjs.org`


## Contribution
Thank you for considering to help out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to ERC20Withdraw.solidity, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base. 


## License  

ERC20Withdraw.solidity is an GPL v3.0-licensed open source project with its ongoing development made possible entirely by the support of the elastos team. 

[![License: GPL v3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)

This project is licensed under the GNU General Public License v3.0. See the LICENSE file for details.

const { ethers, getChainId} = require('hardhat')
const { readConfig,isTxSuccess} = require('./helper')


const Web3 = require('web3')
const web3 = new Web3('https://api-testnet.elastos.io/eth')

const main = async () => {

    console.log("7 request Ethereum Post ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);
    
    let nonce = await web3.eth.getTransactionCount(deployer.address);
    console.log("xxl nonce is :",nonce);

}



main();

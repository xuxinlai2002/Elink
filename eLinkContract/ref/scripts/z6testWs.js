
const { ethers, getChainId} = require('hardhat')
const { providers,Wallet,utils} = require('ethers')

const {
    writeConfig,
    readConfig
} = require('./helper')



const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://api-testnet.elastos.io/esc-ws'));

const main = async () => {


    console.log("xxl 6testWs ....");
    const subscription = web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
        if (error) return console.error(error);
        
        console.log('Successfully subscribed!', blockHeader);
        }).on('data', (blockHeader) => {
        console.log('data: ', blockHeader);
        });
        
        // unsubscribes the subscription
        subscription.unsubscribe((error, success) => {
        if (error) return console.error(error);
        
        console.log('Successfully unsubscribed!');
        });

}



main();

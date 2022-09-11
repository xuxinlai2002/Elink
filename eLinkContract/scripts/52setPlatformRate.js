
const { ethers, getChainId} = require('hardhat')
const { readConfig,isTxSuccess,sleep} = require('./helper')
const { utils} = require('ethers')


const main = async () => {

    console.log("7 request Ethereum Post ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const DataConsumer__Contract = await ethers.getContractFactory('DataConsumer',deployer)
    let dataConsumerAddress = await readConfig("1","DATACONSUMER_ADDRESS");
    let dataConsumer = await DataConsumer__Contract.connect(deployer).attach(dataConsumerAddress);

    // let amount = utils.parseEther("0.1");
    // await dataConsumer.setPlatformRate(5000);

    let result  = await dataConsumer.getPlatformRate();
    
    console.log("xxl result :",result);


}



main();

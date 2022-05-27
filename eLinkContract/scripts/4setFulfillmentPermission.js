
const { ethers, getChainId} = require('hardhat')

const { readConfig,isTxSuccess} = require('./helper')

const main = async () => {

    console.log("4 set Fulfillment Permission ");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const ORACLE__Contract = await ethers.getContractFactory('Operator',deployer)
    let oracleAddress = await readConfig("3","ORACLE_ADDRESS");
    let accountAddress = await readConfig("3","ACCOUNT_ADDRESS");
    
    oracle = await ORACLE__Contract.connect(deployer).attach(oracleAddress);

    console.log("oracle address : " + oracle.address);

    let resultObj = await oracle.setAuthorizedSenders([accountAddress],
        {
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        });
    let isOK = await isTxSuccess(resultObj)
    console.log("transfer : ",isOK);
}



main();

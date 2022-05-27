
const { ethers, getChainId} = require('hardhat')
const { readConfig} = require('./helper')

const main = async () => {

    console.log("6 get arbiter list ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const DataConsumer__Contract = await ethers.getContractFactory('DataConsumer',deployer)
    let dataConsumerAddress = await readConfig("5","DATACONSUMER_ADDRESS");

    let dataConsumer = await DataConsumer__Contract.connect(deployer).attach(dataConsumerAddress);  
       
    let _oracle =  ("0x4f5BF88fb29f9F0B10543153aA1c240E2f27EB92").toLowerCase();
    let _jobId = "3ecd8c94d2644e839068445ce4bde86c";
    let _pubKey = "03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914"
    // let _address = ("5b4A755b609bca3CAFb48bA893973ef6Fa146554").toLowerCase();
    let _sign = "19784b9626dcd658ac7d552722a93c6dee38b57f93e16956c8d72bc61b136feaec182fae781fab25d1edf6c50921b443c1a95a65eb513655cf65548180d33e43"
    
    await dataConsumer.addOralceAndJobId(
        _oracle,_jobId,_pubKey,_sign,{
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        }
    );



}


main();

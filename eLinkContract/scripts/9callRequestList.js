
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
    
    let res = await dataConsumer.getOralceAndJobs();
    console.log("xxl res",res);

    
    // let _oracle =  ("0x41eA6aD88bbf4E22686386783e7817bB7E82c1ed").toLowerCase();
    // let _jobId = "1390afd8a08e4e61aae9961d338c8011";
    // let _pubKey = "03585451831671d32c12da70f009adb6e423dfbfdd012368d9038c8b896918a62a"
    // let _address = ("5b4A755b609bca3CAFb48bA893973ef6Fa146554").toLowerCase();
    // let _sign = "e121cec02c815385f40f552ba375664bce8fccdc36a6b43d1f23832e980f68d6c7c6194de03c380aebba2cab55c96b6c19a65975f0aee3bc4e6074bed23333d7"
    
    // await dataConsumer.addOralceAndJobId(
    //     _oracle,_jobId,_pubKey,_address,_sign,
    //     {
    //         gasPrice: 0x02540be400,
    //         gasLimit: 0x7a1200
    //     }
    // );

    // let res = await dataConsumer.getOralceAndJobs();
    // console.log("xxl res",res);

}


main();


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
      
    // xuxinlai@xxl accountTool % ./accontTool /Users/xuxinlai/work/Elink/1node/keystore.dat 123 38e1f933c849dae330e6efb3c5cabab5cde376f3c64aa3376edc4f329adbab44dfe0f3e1
    // publick key: 03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914
    // signature  : e89d40ad1079426646d426d25efedb2c2eb151500cf09b49408f1179f54a284f1d7d0c419f0708c433f86a418fb38151f46db27f072b9ea1ecde04b87677c5e9
    
    //0x38e1f933c849dae330e6efb3c5cabab5cde376f3
    //c64aa3376edc4f329adbab44dfe0f3e1
    let _oracle =  ("0x38e1f933C849Dae330E6EFb3c5cABAb5CDE376F3").toLowerCase();
    let _jobId = "c64aa3376edc4f329adbab44dfe0f3e1";
    let _pubKey = "03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914"
    let _sign = "995deeaf54aa4efdc77e150e62b8343c5a69614009979671ae7ee105694b88afd294bd03d32ff046bb7c59686b91494d29c31cc5cbc702e9fc792c7e2b49faf3"
    
    await dataConsumer.addOralceAndJobId(
        _oracle,_jobId,_pubKey,_sign,{
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        }
    );


    
}


main();

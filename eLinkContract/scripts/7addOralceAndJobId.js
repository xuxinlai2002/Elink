
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
      
    // xuxinlai@xxl accountTool % ./accountTool /Users/xuxinlai/work/Elink/1node/keystore.dat 123 3013e83c52538024900f40f2d58fc311530fd04faff521b50faa4126823e9e400bbe931c
    // publick key: 03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914
    // signature  : a246b402a2c5b9f6b5b2175c3573b4470fc82be12b0c7b5a47d6432f5eff55543e4fbb7974562568284f3532bb379fa12838a5a6674940e279163daf30356417
    
    //3013e83c52538024900f40f2d58fc311530fd04f
    //3013e83c52538024900f40f2d58fc311530fd04faff521b50faa4126823e9e400bbe931c
    let _oracle =  ("0x3013e83c52538024900f40f2d58fc311530fd04F").toLowerCase();
    let _jobId = "aff521b50faa4126823e9e400bbe931c";
    let _pubKey = "03bfd8bd2b10e887ec785360f9b329c2ae567975c784daca2f223cb19840b51914"
    //
    let _sign = "471677f4968814092c5a881c5bd444ea2eb7b51d4f5a70127e9f4a5bf6922738f20a82e2dade41580c24458723e54815025561bb62245daa8f5de2b1031c1442"
    
    await dataConsumer.addOralceAndJobId(
        _oracle,_jobId,_pubKey,_sign,{
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        }
    );


    
}


main();

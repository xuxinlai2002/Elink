
const { ethers, getChainId} = require('hardhat')
const { readConfig} = require('./helper')

const main = async () => {

    console.log("6 get arbiter list ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const DataConsumer__Contract = await ethers.getContractFactory('DataConsumer',deployer)
    let dataConsumerAddress = await readConfig("1","DATACONSUMER_ADDRESS");
  
    let dataConsumer = await DataConsumer__Contract.connect(deployer).attach(dataConsumerAddress);    

    let resultParam = await dataConsumer.getChannelInfoList();

    for(var i = 0 ;i < 3 ;i ++){
        if(resultParam[i].status != 0){
            console.log("\n####%d ",i);
            console.log("did      : %s",resultParam[i].did);
            console.log("method   : %s",resultParam[i].method);
            console.log("status   : %s",resultParam[i].status);
            console.log("dataHash : %s",resultParam[i].dataHash);
            console.log("data     : %s",resultParam[i].data);
            for(var j = 0 ; j < 12 ;j ++){
                if(resultParam[i].requestInfoList[j].isSearched){
                    console.log("***requestId ",resultParam[i].requestInfoList[j].requestId);
                    console.log("***isSearched ",resultParam[i].requestInfoList[j].isSearched);
                }
               
            }

        }
    }
  

}



main();

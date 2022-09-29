
const { ethers, getChainId} = require('hardhat')
const { readConfig,sleep,isTxSuccess,printCurTimeForTest} = require('./helper')


const Web3 = require('web3')
const web3 = new Web3('https://api-testnet.elastos.io/eth')

const main = async () => {

    console.log("40 press test  ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const DataConsumer__Contract = await ethers.getContractFactory('DataConsumer',deployer)
    let dataConsumerAddress = await readConfig("1","DATACONSUMER_ADDRESS");
    let dataConsumer = await DataConsumer__Contract.connect(deployer).attach(dataConsumerAddress);
    

    let nonce = await web3.eth.getTransactionCount(deployer.address);
    console.log("xxl nonce is :",nonce);

    let pressNum = 50;
    let timeForWait = 3000;


    printCurTimeForTest();
    for(var i = 0 ;i < pressNum ;i ++){
        
        try{
            console.time("test" + i);

            dataConsumer.requestResultFromList(
                // "did:elastos:iULReN45NDUrzL1fGx3dHr62zNwMuFsAux#passport",
                "did:elastos:iULReN45NDUrzL1fGx3dHr62zNwMuFsAu#passport" + i,
                "did_resolveCredential",
                {
                    gasPrice: 0x02540be400 * 2,
                    // gasLimit: 0x7a1200,
                    nonce:nonce ++ 
                } 
            );

            // let re = await dataConsumer.requestResultFromList(
            //     // "did:elastos:iULReN45NDUrzL1fGx3dHr62zNwMuFsAux#passport",
            //     "did:elastos:iULReN45NDUrzL1fGx3dHr62zNwMuFsAu#passport" + i,
            //     "did_resolveCredential",
            //     {
            //         gasPrice: 0x02540be400 * 2,
            //         nonce:nonce ++ 
            //     } 
            // );
    
            // console.log("xxl re",re);

            await sleep(timeForWait);
            console.timeEnd("test" + i);
        }catch(e){
            console.log("xxl e ", e);
        }

        
    }



}



main();

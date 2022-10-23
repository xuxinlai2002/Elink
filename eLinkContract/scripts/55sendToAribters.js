
const { ethers, getChainId} = require('hardhat')
const { readConfig,isTxSuccess,sleep} = require('./helper')
const { utils} = require('ethers')


const main = async () => {

    console.log("7 request Ethereum Post ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[1];
    console.log("chainID is :" + chainID + " address :" + deployer.address);


    let addressList = [
        "0x8cce324CCb53bB7F6bC94D7A587089CCA665C110",
        "0x19280Ec56aE954AA0C853EE99A0024EA91cFF313",
        "0xb7a35cb9C42c3f5a02aB57F11A41D901D820Ddd5",
        "0xD5EaB28AdfEf8b8f10299eCA3A5eDD36b6086a9E",
        "0xbFBd282C9343e4e553B035b61C7c2308F85DE215",
        "0x9aDcA3C1536ba1b6d253e29c88D4899cee016E0b",
        "0x877A5160D32dB21E5a33DC6A5080bC1402954Cf8",
        "0x5bA5557cCde0FdcdB7b8C4f3E70cb813986D14A9",
        "0x635e6Eda01EA2A89295a77013c50Ed2f9eF9F0f1",
        "0xf488D9329D896593E1EDb6BB35538b0D68798044",
        "0x9aE9592a9Ba00e762b49EF80e69AdF1F092d5d72",
        "0xA483C62Ef62edE6641A419A9bb3a9158bBBDBB3b",
    ]

    for(var i = 0 ;i < addressList.length ;i ++){
        await deployer.sendTransaction({
            to: addressList[i],
            value: ethers.utils.parseEther("10.0"), // Sends exactly 1.0 ether
        });

        await sleep(2000);

        console.log("addressList is %d - %s",i+1,addressList[i]);
    
    }



}



main();

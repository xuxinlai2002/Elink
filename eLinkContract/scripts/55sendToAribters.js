
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
        "0xDA580436a284a84C71f09C6Ec2e272edEA9443e1",
        "0xbeCA5C0FaCa8b27C53a18378d69E167a1b506722",
        "0xDaE1f9da360FB77CA8C3CB1f5E1aF03686a100f3",
        "0x2a7Ca05Bd915F6ffD8683424A6Ae75e832eb67f8",
        "0x4C10096f9dA73cfa0bB5Fc8b50De8c8d3291AeC9",
        "0xe400291411677bEc2eB46f447A50097c6aA23C9C",
        "0x9f72962699d11DD00bc00eF15491A134d5E6BB0B",
        "0x4e937EA5D0b3745Dbca6096597C7f73731c3eaC1",
        "0x29ed15375C2aA5A33D316cf4b10781AE42580044",
        "0xBe78Dd9E33A5eD146e21f4B6380EF4D2492C0D11",
        "0x6A4869503D74367616E4CAcB0f4871A1588F6B2d",
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

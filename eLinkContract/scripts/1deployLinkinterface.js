
const { ethers, getChainId} = require('hardhat')
const { writeConfig,readConfig } = require('./helper')

const main = async () => {


    console.log("1 deploy link interface");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const LINKInterface__Contract = await ethers.getContractFactory('LinkInterface',deployer)
    const LINKInterface = await LINKInterface__Contract.connect(deployer).deploy();
    console.log(LINKInterface.address);
    await writeConfig("0","1","LINK_INTERFACE_ADDRESS",LINKInterface.address);

    let linkAddress = await readConfig("0","LINK_ADDRESS");
    console.log("set Address ",linkAddress);

    await LINKInterface.setAddress(linkAddress,
        {
            gasPrice: 0x02540be400,
            gasLimit: 0x7a1200
        });


}



main();

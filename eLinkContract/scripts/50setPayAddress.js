
const { ethers, getChainId} = require('hardhat')
const { readConfig,isTxSuccess,sleep} = require('./helper')

const main = async () => {

    console.log("7 request Ethereum Post ....");

    let chainID = await getChainId();
    let accounts = await ethers.getSigners()
    let deployer = accounts[0];
    console.log("chainID is :" + chainID + " address :" + deployer.address);

    const DataConsumer__Contract = await ethers.getContractFactory('DataConsumer',deployer)
    let dataConsumerAddress = await readConfig("1","DATACONSUMER_ADDRESS");
    let dataConsumer = await DataConsumer__Contract.connect(deployer).attach(dataConsumerAddress);
    

    let jobIds = [
        '1701e753fe574fe49ec0c3e8835963f8',
        'e42d380614af4e8184f869a5eb212d05',
        'd1dea183d2414379972c32e2777abffd',
        '0dc7260a878b4052804a0ca37ae00c8e',
        '260819954a434a52aa02c3712e5a90f5',
        '8108af18b79e47708ada33e6466fd4d9',
        'afa8dda4dd0644f493bca81ef6d4fa95',
        '56b07d16288040f0841550cd80054695',
        '77db8216ced74cc1b36babb981d0f018',
        '2ba49a8944da45e68a2c62cf77e82a2b',
        '49e7e6bf1b0b41ddb75a9600fc2be444',
        '6c854b7448c94dbfad27d6cefcf0e22b'
    ]

    let addresses = [
        '0x46A26B330c0988a58aFF56e2a106F8256Ca89872',
        '0xebE2F80dFc5Eb9b84693089BC483064dca6F40c6',
        '0x2A5f210545521466A3d77D8ACf89ae026DB31eb1',
        '0x440B260F5410a9DE0baD7C842EAEaD5Eb6Bda57d',
        '0xE4Fe14c38f7D8BaFcC7FE6cECeFA08c6bAd3C6D0',
        '0xabfc60BE44BD1770924265109Da7E211ad91440B',
        '0x79E3853Be1BD9bF35A0833F7ABCcD962420f0546',
        '0x5c22789098D37f89437E997294c34F2dE0548F80',
        '0x63437aC0bF8be083917776e0a10D142819afF893',
        '0x3Fe2C3FBBEa803A3c1abd5e42d90A8db3710B74B',
        '0x2C60233ea354eC68CBFeB5F74B6c8cacca21f4cB',
        '0x648C8E2AaC5B019a356770B2C324329686717fa1'
    ]


    // // did_resolveCredential
    // for(var i = 0 ;i < jobIds.length ;i ++){

    //     await dataConsumer.setPayMap(
    //         jobIds[i],addresses[i]
    //     );
    // }

    // await sleep(5000);

    for(var i = 0 ;i < jobIds.length ;i ++){

        let address =  await dataConsumer.getPayMap(jobIds[i]);
        console.log("getPayMap ",jobIds[i],address);
    }
    

}



main();

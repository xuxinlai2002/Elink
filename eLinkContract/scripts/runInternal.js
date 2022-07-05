
const { ethers, getChainId} = require('hardhat')
const { utils} = require('ethers')
const { writeConfig, sleep ,readConfig} = require('./helper')
const { execSync } = require('child_process')    
const axios = require('axios').default;
require('dotenv').config();

const log4js = require('log4js');
log4js.configure({
    appenders:  { out: { type: "file", filename: "logs/out.log" } },
    categories: { default: { appenders: ["out"], level: "info" } }
});

const logger = log4js.getLogger(); 
let cmd = "",showInfo="",result="",no = 0;

const main = async () => {

    //clear postgres
    await clearPostgres();
    await sleep(2000);

    //clear chainLink
    await clearChainLink();
    await sleep(2000);

    //start postgres
    await startPostgres();
    await sleep(20000);

    //start start chainlink
    await startChainlink();
    await sleep(20000);

    //set session
    await setSession();
    await sleep(2000);

    await addChainLinkAccount();
    await sleep(2000);

    await deployOralce();
    await setFulfillmentPermission();

    await createJob();
    await sleep(2000);
    
    await deployDataConsumer();
    await getAribtrSign();
    await callAddOracleAddJobId();

}
 

main();

async function clearPostgres(){
    
    //clear data
    cmd = `rm -rf ${process.env.db_path}/*`
    showInfo = "clear data [postgres database]";
    try{ await runCmd()}catch(err){}

    //clear postgres
    cmd = "docker rm -f postgres /dev/null 2>&1 ";
    showInfo = "clear container [postgres database]";
    try{ await runCmd()}catch(err){}

}

async function clearChainLink(){

    //clear chainlink
    cmd = "docker rm -f chainlink /dev/null 2>&1 ";
    showInfo = "clear container [chainlink node]";
    try{ await runCmd()}catch(err){}
}

async function startPostgres(){

    //start postgres
    let dbPassword = process.env.db_password;
    let dbPath = process.env.db_path

    cmd =`mkdir -p ${dbPath}`;
    try{ await runCmd(false)}catch(err){}
    
    showInfo="start container [postgres database]";
    cmd = ` 
        docker run -d \
        --name postgres \
        -p 5432:5432 \
        -e POSTGRES_PASSWORD=${dbPassword} \
        -e PGDATA=/var/lib/postgresql/data/pgdata \
        -v ${dbPath}:/var/lib/postgresql/data \
        postgres  \
    `
    try{ await runCmd()}catch(err){console.log("xxl error",err);}

}

async function startChainlink(){

    //start chainlink
    await writeEvnFile();
    await addLinkAccountAndPassword();

    await sleep(2000);

    showInfo="start container [chainlink node]";
    cmd = ` 
    cd ${process.env.link_path} && 
    docker run -d -p 6688:6688 -v ${process.env.link_path}:/chainlink -it \
    --env-file=.env --name chainlink \
    smartcontract/chainlink:1.3.0 local n \
    -p /chainlink/password.txt \
    -a /chainlink/apicredentials.txt
    `
    try{ await runCmd()}catch(err){console.log("xxl error",err);}
}

async function addChainLinkAccount(){

    cmd = "curl -b ./cookie -c ./cookie localhost:6688/v2/keys/eth";
    try{
        showInfo = "get [chainlink account]" 
        result = await runCmd()
        let resultObj = JSON.parse(result);
        
        if(resultObj.data.length > 0){
            await writeConfig("1","1","ACCOUNT_ADDRESS",resultObj.data[0].id);
        }else{
            console.log("get [chainlink account] error ");
            exit -1;
        }
    }catch(err){
        console.log("xxl error",err);
    }
}

async function deployOralce(){

    //
    cmd = `yarn scripts scripts/3deployOracle.js --network ${process.env.enviroment}`;
    showInfo="deploy [oracle contract]";
    try{ await runCmd()}catch(err){console.log("xxl error",err);}

}

async function setFulfillmentPermission(){
    //
    cmd = `yarn scripts scripts/4setFulfillmentPermission.js --network ${process.env.enviroment}`
    showInfo="set [fulfillment permission]";
    try{ await runCmd()}catch(err){console.log("xxl error",err);}
}


async function callAddOracleAddJobId(){

    cmd = `yarn scripts scripts/7addOralceAndJobId.js --network ${process.env.enviroment}`;
    showInfo="call [add oralce and jobid]";
    try{ await runCmd()}catch(err){console.log("xxl error",err);}

}

async function deployDataConsumer(){
    cmd = `yarn scripts scripts/5dataConsumer.js --network ${process.env.enviroment}`;
    showInfo="deploy [dataConsumer contract]";
    try{ await runCmd()}catch(err){console.log("xxl error",err);}
}

async function getAribtrSign(){

    let oracleAddress =  await readConfig("5","ORACLE_ADDRESS");
    let jobId = await readConfig("5","JOB_ID");
    let oracleAndJobId = oracleAddress.toLowerCase().substr(2) + jobId
    // console.log("xxl :",oracleAndJobId);
    
    cmd = `${process.env.account_tool_Path} ${process.env.keystore_path} ${process.env.keystore_password} ${oracleAndJobId}`;
    showInfo="get [arbiter signature]";
    try{ 
        let resultObj = await runCmd();
        
        var resultArray = resultObj.split("\n");
        if(resultArray.length > 2){
            publicKey = resultArray[0].split(":")[1].trim();
            signtrue = resultArray[1].split(":")[1].trim();
            await writeConfig("5","5","PUBLIC_KEY",publicKey);
            await writeConfig("5","5","SIGNTRUE",signtrue);
        }else{
            console.log("parse [account tool] error");
            exit -1;
        }
        //console.log("xxl resultObj ",signtrue);
        return signtrue;
    }catch(err){
        console.log("xxl error",err);
    }
}


async function runCmd(isShowInfo=true) {

    try{
        result = await execSync(cmd, {encoding: 'utf8'});   
        logger.info(result);    
        if(isShowInfo){
            no ++;
            let strShowInfo = `step ${no} : ${showInfo} `
            console.log(strShowInfo);
            //logger.info(strShowInfo);
        }
        return result;
    }catch(err){
        console.log("xxl runCmd ",err);
        throw new Error(err);
    }

}

const fs = require('fs');
const { exit } = require('process');
async function writeEvnFile(){

    let linkPath = process.env.link_path
    cmd =`mkdir -p ${linkPath}`;
    try{ await runCmd(false)}catch(err){}

    let evnContent =`ROOT=/chainlink
LOG_LEVEL=warn
ETH_CHAIN_ID=${process.env.chain_id}
MIN_OUTGOING_CONFIRMATIONS=1
LINK_CONTRACT_ADDRESS=${process.env.link_address}
CHAINLINK_TLS_PORT=0
SECURE_COOKIES=false
GAS_UPDATER_ENABLED=false
ALLOW_ORIGINS=*
ETH_URL=ws://${process.env.internal_url}:${process.env.esc_ws_port}
DATABASE_URL=postgresql://postgres:elastos@${process.env.internal_url}:5432/postgres?sslmode=disable
DATABASE_TIMEOUT=0
DEFAULT_HTTP_TIMEOUT=100s
MINIMUM_CONTRACT_PAYMENT_LINK_JUELS=0
ETH_GAS_LIMIT_DEFAULT=1150000
DEFAULT_HTTP_LIMIT=3276800
`
    let linkPathEnv = process.env.link_path + "/.env";
    fs.writeFileSync(linkPathEnv,evnContent, { encoding: 'utf8' }, err => {})

}

async function addLinkAccountAndPassword(){

    let evnContent =`${process.env.link_account}
${process.env.link_password}
`
    let linkPathEnv = process.env.link_path + "/apicredentials.txt";
    fs.writeFileSync(linkPathEnv,evnContent, { encoding: 'utf8' }, err => {})

    let passwordContent =`${process.env.db_password}`
    let linkPathPassword = process.env.link_path + "/password.txt";
    fs.writeFileSync(linkPathPassword,passwordContent, { encoding: 'utf8' }, err => {})

}


async function setSession(){

    cmd = `curl -c ./cookie -H 'Content-Type: application/json' -d \
        '{"email":"${process.env.link_account}", "PASSWORD":"${process.env.link_password}"}' \
        localhost:6688/sessions 2>/dev/null `

    try{ 
        let resultObj = await runCmd(false)
        // console.log("xxl resultObj : ",resultObj);
    }catch(err){
        // await setSession();
        console.log("xxl error ",err);
        exit -1;
    }

}

async function createJob(){

    let oracleAddress = await readConfig("3","ORACLE_ADDRESS");
    //console.log("xxl oracleAddress",oracleAddress);
    let jobSpec = `
    type = "directrequest"
    schemaVersion = 1
    name = "POST > Elink1 ${process.env.enviroment}"
    maxTaskDuration = "0s"
    contractAddress = "${oracleAddress}"
    minIncomingConfirmations = 0
    observationSource = """
        decode_log   [type="ethabidecodelog"
                      abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                      data="$(jobRun.logData)"
                      topics="$(jobRun.logTopics)"]
    
        decode_cbor  [type="cborparse" data="$(decode_log.data)"]
        
        fetch        [type="http" method=POST url="${process.env.internal_url}:7789/test" 
                     requestData="{'jsonrpc':'2.0','method':'did_resolveDID','params':[{'did':$(decode_cbor.did)}],'id':1}"
                     ]
    
        encode_large [type="ethabiencode"
                    abi="(bytes32 requestId, bytes _data)"
                    data="{'requestId': $(decode_log.requestId), '_data': $(fetch)}"
                    ]
    
        encode_tx  [type="ethabiencode"
                    abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes calldata data)"
                    data="{'requestId': $(decode_log.requestId), 'payment':   $(decode_log.payment), 'callbackAddress': $(decode_log.callbackAddr), 'callbackFunctionId': $(decode_log.callbackFunctionId), 'expiration': $(decode_log.cancelExpiration), 'data': $(encode_large)}"
                    ]
    
        submit_tx    [type="ethtx" to="${oracleAddress}" data="$(encode_tx)"]
    
        decode_log -> decode_cbor -> fetch ->  encode_large -> encode_tx -> submit_tx
    """
    `
    let jsonJobSpec = {
        "TOML":jobSpec
    }

    var strJobSpec = JSON.stringify(jsonJobSpec);
    try{
        cmd = `curl  --request POST -b ./cookie -c ./cookie  -H 'Content-Type: application/json' -d '${strJobSpec}' localhost:6688/v2/jobs`;
        showInfo="submit [chainlink job]";
        result = await runCmd()
        let resultObj = JSON.parse(result);
        let jobId = resultObj.data.attributes.externalJobID.replaceAll("-","");
        await writeConfig("3","3","JOB_ID",jobId);
        
    }catch(err){
        console.log("xxl error",err);
    }


}
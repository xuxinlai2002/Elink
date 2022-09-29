const Web3 = require('web3')
require('dotenv').config({path:'../.env'});

// const web3 = new Web3(`ws://${process.env.internal_url}:${process.env.esc_ws_port}`)
const web3 = new Web3("wss://api-testnet.elastos.io/esc-ws");
const { hex2a,printCurTimeForTest } = require('./helper')

// a list for saving subscribed event instances
const subscribedEvents = {}
// Subscriber method
const subscribeLogEvent = (contract, eventName) => {

  //console.log("xxl web3 123 ---- ",web3.utils._);
  const eventJsonInterface = web3.utils._.find(
    contract._jsonInterface,
    o => o.name === eventName && o.type === 'event',
  )

  let num = 0;
  let otherNum1 = 0;
  let otherNum2 = 0;
  let otherNum3 = 0;
  const subscription = web3.eth.subscribe('logs', {
    address: contract.options.address,
    topics: [eventJsonInterface.signature]
  }, (error, result) => {
    
    if (!error) {
      const eventObj = web3.eth.abi.decodeLog(
        eventJsonInterface.inputs,
        result.data,
        result.topics.slice(1)
      )

      // console.log("xxl eventObj ",eventObj);
      // console.log("xxl 2",eventObj);
      // if(eventObj.hasOwnProperty("logNum")){
      //   console.log("--------------search log--------------"); 
      //   console.log("data logNum :  ",eventObj.logNum); 
      //   console.log("data requestId :", eventObj.requestId)
      //   console.log("data data :", eventObj.data)
      //   console.log("block number :  ",result.blockNumber); 
      //   console.log("data datahash :", eventObj.datahash)
      //   console.log("data totalSearchNum :", eventObj.totalSearchNum)
      //   console.log("data hitSearchNum :", eventObj.hitSearchNum)
      // }else if(eventObj.hasOwnProperty("key")){
      if(eventObj.hasOwnProperty("key")){
        console.log("--------------search condition--------------"); 
        console.log("block number :  ",result.blockNumber); 
        console.log("data requestId :", eventObj.requestId)
        console.log("data searchKey :", eventObj.key)
      }else if(eventObj.hasOwnProperty("data")){
        printCurTimeForTest();
        console.log("\n**************search result************** :", ++ num ); 
        //console.log("data bytes:", eventObj.data)
        //console.log("data hash :", web3.utils.sha3(eventObj.data));
        console.log("block number :  ",result.blockNumber); 
        console.log("data requestId :", eventObj.requestId)
        console.log("data result :", hex2a(eventObj.data));
      }else if(eventObj.hasOwnProperty("logNum")){

        if(eventObj["logNum"] + "" == "0"){
          // console.log("\n**************request from list start ************** :", ++ otherNum1 ); 
          console.log("0**************.request start data requestId :", ++ otherNum1,eventObj.requestId)
          // console.log(eventObj);
          //console.log("other event");

        }

        if(eventObj["logNum"] + "" == "1"){
          // console.log("\n**************search rqueest id ************** :", ++ otherNum2 ); 
          console.log("1--------------.search rqueest data requestId :",  ++ otherNum2,eventObj.requestId)
          // console.log(eventObj);
          // console.log("other event");

        }

        if(eventObj["logNum"] + "" == "2"){
            //console.log("1--------------.search callback************** :", ++ otherNum3 ); 
            console.log("2#############.search callback data requestId :",  ++ otherNum3,eventObj.requestId)
            // console.log(eventObj);
            // console.log("other event");

        }
      }else{
         console.log("fLog",eventObj);
      }

    }

  })

  subscribedEvents[eventName] = subscription
}

const {
  readConfig,
} = require('./helper')

const main = async () => {

  console.log("**************** watch elink data ****************");
  let dataConsumerAddress = await readConfig("1","DATACONSUMER_ADDRESS");
  const dataConsumer = require('../artifacts/contracts/DataConsumer.sol/DataConsumer.json');
  console.log("dataConsumerAddress is ",dataConsumerAddress);


  let dataConsumerInstance = new web3.eth.Contract(dataConsumer.abi,dataConsumerAddress)

  // subscribeLogEvent(dataConsumerInstance,"Log");
  // subscribeLogEvent(dataConsumerInstance,"SearchInfo");

  // subscribeLogEvent(dataConsumerInstance,"SearchResult1");
  // subscribeLogEvent(dataConsumerInstance,"SearchResult2");
  // subscribeLogEvent(dataConsumerInstance,"SearchResult3");
  // subscribeLogEvent(dataConsumerInstance,"SearchResult4");

  subscribeLogEvent(dataConsumerInstance,"SearchConformed");
  //subscribeLogEvent(dataConsumerInstance,"LogAddress");
  subscribeLogEvent(dataConsumerInstance,"Log");  
  // subscribeLogEvent(dataConsumerInstance,"FLog");  

  

  

}

main();

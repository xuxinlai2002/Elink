const { 
    sleep ,
    setSession,
    addChainLinkAccount,
    createJob,
    getAribtrSign,
    callAddOracleAddJobId,
    setFulfillmentPermission,
} = require('./helper')


const main = async () => {

    //set session
    await setSession();
    await sleep(2000);

    await addChainLinkAccount();
    await sleep(2000);

    await setFulfillmentPermission();

    await createJob();
    await sleep(2000);
    
    await getAribtrSign();
    await callAddOracleAddJobId();

}
 

main();

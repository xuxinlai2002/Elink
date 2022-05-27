const { ethers: hEether } = require('hardhat');
const fs = require('fs')
const path = require('path')

const writeConfig = async (fromFile,toFile,key, value) => {

    let fromFullFile = path.resolve(getConfigPath(), './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
    data[key] = value;

    let toFullFile = path.resolve(getConfigPath(), './' + toFile + '.json')
    fs.writeFileSync(toFullFile, JSON.stringify(data, null, 4), { encoding: 'utf8' }, err => {})

}

const readConfig = async (fromFile,key) => {

    let fromFullFile = path.resolve(getConfigPath(), './' + fromFile + '.json')
    let contentText = fs.readFileSync(fromFullFile,'utf-8');
    let data = JSON.parse(contentText);
    return data[key];

}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
}

const getConfigPath = () => {
    //return "scripts/config"
    return path.resolve(__dirname, '.') + "/config"
}

const isTxSuccess = async (resultObj) =>{

    let repObj = await resultObj.wait();  

    console.log(repObj);
    
    return repObj.status == 1 ? true:false

}


function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
  

module.exports = {
    writeConfig,
    readConfig, 
    sleep,

    isTxSuccess,
    hex2a


}
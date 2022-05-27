// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;
import "./chainlink/ChainlinkClient.sol";
import "./bytesUtils/BytesLib.sol";

import "./Arbiter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "hardhat/console.sol";

contract DataConsumer is 
    ChainlinkClient,  
    Initializable,
    OwnableUpgradeable,
    Arbiter{

  using Chainlink for Chainlink.Request;
  uint256 constant private ORACLE_PAYMENT = 0;

  bytes32   public dataHash;  
  uint8     public totalSearchNum;
  uint8     public hitSearchNum ;
  uint256[ARBITER_NUM] public searchBlockNum ;
  bool      public isSearchConformed;

  address[] private oracles;
  string[] private  jobIds;
  string private version;

  // map did -> data
  struct ChainLinkInfo{
    address oracle;
    string jobId;
  }

  mapping( bytes32 => ChainLinkInfo) private chainlinkInfoMap;

  event SearchInfo(
    bytes32 indexed requestId,
    string key
  );

  event SearchConformed(
    bytes32 indexed requestId,
    bytes data,
    uint256 blockNumber,
    bytes32 datahash
  );

  /**
    * @dev __DataConsumer_init
      @param _version version of ERC1155 Platform
    */
  function __DataConsumer_init(
      string memory _version
  ) public initializer{
      
      setPublicChainlinkToken();
      version = _version;
      dataHash = bytes32(0);
      totalSearchNum = 0;
      hitSearchNum = 0;
      isSearchConformed = false;
      __Ownable_init();
  }

  //function p256Verify(string memory _pubkey, string memory  _data, string memory _sig) public view returns(bool){
  function addOralceAndJobId(
      address _oracle,
      string memory _jobId,
      string memory _pubKey,
      string memory _sign
    ) external {
      
      bool isVerified = false;
// console.log("Param pubKey %s",_pubKey);
// console.log("Param sign %s",_sign);
  
      string memory strOracleAndJobId = strConcat(addressToString(_oracle),_jobId);
// console.log("Ref strOracleAndJobId %s ",strOracleAndJobId);
      bytes32 oracleAndJobId = keccak256(hexStr2bytes(strOracleAndJobId));
// console.logBytes(hexStr2bytes(strOracleAndJobId));
    
      string memory data = strConcat(bytes32ToString(oracleAndJobId),bytes32ToString(oracleAndJobId));
// console.log("Ref   data %s ",data);
      bytes32 pubKeyHash = keccak256(hexStr2bytes(_pubKey));  
   
      isVerified = p256Verify(_pubKey, data, _sign);
      require(isVerified,"p256Verify do not pass !");

      isVerified = isArbiterInList(pubKeyHash);
      require(isVerified,"arbiter is not in the list !");

      oracles.push(_oracle);
      jobIds.push(_jobId);
    
  }

  function clearOralceAndJobId() onlyOwner external {

    delete oracles;
    delete jobIds;

  }

  function getOralceAndJobs() external view returns(address[] memory ,string[] memory){
    return (oracles,jobIds);  
  }

  function requestResultFromList(string memory did)
    public
  {
    
    uint len = oracles.length;
    for(uint i = 0 ;i < len ; i ++){

      Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(jobIds[i]), address(this), this.fulfillEthereumDidData.selector);

      req.add("did", did);
      req.add("path", "result,transaction");

      sendOperatorRequestTo(oracles[i], req, ORACLE_PAYMENT);

    }

  }

  function requestResultFromParam(address _oracle, string memory _jobId,string memory did)
    public
  {

    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillEthereumDidData.selector);

    req.add("did", did);
    req.add("path", "result,transaction");
    
    bytes32 requestId = sendOperatorRequestTo(_oracle, req, ORACLE_PAYMENT);

    emit SearchInfo(requestId,did);

  }

  function fulfillEthereumDidData(bytes32 _requestId, bytes memory _didData)
    public
    recordChainlinkFulfillment(_requestId)
  {

    if(totalSearchNum == 0){
      dataHash = keccak256(_didData);
      searchBlockNum[totalSearchNum] = block.number;
      totalSearchNum ++ ;
      hitSearchNum ++ ;
    }else{
      
      searchBlockNum[totalSearchNum] = block.number;
      totalSearchNum ++ ;

      if(dataHash == keccak256(_didData)){
        hitSearchNum ++ ;
      }

      if(hitSearchNum * 3 >= ARBITER_NUM * 2){
        isSearchConformed = true;
        emit SearchConformed(_requestId, _didData,block.number,dataHash);
      }

    }

  }

  function getSearchResult() view public returns(bool,bytes32,uint256,uint256,uint256[ARBITER_NUM] memory){

    return (isSearchConformed,dataHash,totalSearchNum,hitSearchNum,searchBlockNum);

  }

  function clearSearchCondition() public onlyOwner{

    dataHash = bytes32(0);
    totalSearchNum = 0;
    hitSearchNum = 0;
    isSearchConformed = false;
    delete searchBlockNum ;

  }

  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

}
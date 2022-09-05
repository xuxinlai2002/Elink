// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;
import "./chainlink/ChainlinkClient.sol";
import "./bytesUtils/BytesLib.sol";

import "./Arbiter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DataConsumer is ChainlinkClient,Initializable,OwnableUpgradeable,Arbiter{

    uint256 constant public MAX_CHANNEL = 20;
    uint256 constant private ORACLE_PAYMENT = 0;

    using Chainlink for Chainlink.Request;

    address[] private oracles;
    string[]  private jobIds;
    string    private version;
    uint256   private id;
    
    struct RequestInfo{
      bytes32 requestId;
      bool isSearched;
    }

    struct ChannelInfo {
        string did;
        string method;
        uint8 status; //0: idle 1:searching 2:finish
        bytes32 dataHash;
        //bytes data;
        RequestInfo[ARBITER_NUM] requestInfoList;
    }
    ChannelInfo[MAX_CHANNEL] private channelInfoList;

    mapping( string => address) jobIdReceiverMap;
    uint256 platformRate;
    mapping( uint256 => mapping( bytes32 => string) )chanelNumRequestIdJobIdMap;
    bool isLocked;

    event Log(
      bytes32 indexed requestId,
      uint8 logNum
    );

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
        id = 0;
        __Ownable_init();
        _initChannelInfoList();

    }


    function _initChannelInfoList() internal {

      for(uint i = 0 ;i < MAX_CHANNEL ;i ++ ){
        _initChannelByNum(i);
      }

    }

    function _initChannelByNum(uint _channelNum) internal{
            
      channelInfoList[_channelNum].did = "";
      channelInfoList[_channelNum].method = "";
      channelInfoList[_channelNum].status = 0;
      channelInfoList[_channelNum].dataHash = bytes32(0);
      //channelInfoList[_channelNum].data = "";

        for(uint i = 0 ;i < ARBITER_NUM ;i ++ ){
          channelInfoList[_channelNum].requestInfoList[i].requestId = bytes32(0);
          channelInfoList[_channelNum].requestInfoList[i].isSearched = false;
        }

    }

    function addOralceAndJobId(
        address _oracle,
        string memory _jobId,
        string memory _pubKey,
        string memory _sign
      ) external{
        
        bool isVerified = false;

        string memory strOracleAndJobId = strConcat(addressToString(_oracle),_jobId);
        bytes32 oracleAndJobId = keccak256(hexStr2bytes(strOracleAndJobId));    
        string memory data = strConcat(bytes32ToString(oracleAndJobId),bytes32ToString(oracleAndJobId));
        bytes32 pubKeyHash = keccak256(hexStr2bytes(_pubKey));  

        //xxl Done
        isVerified = p256Verify(_pubKey, data, _sign);
        require(isVerified,"p256Verify do not pass !");

        isVerified = isArbiterInList(pubKeyHash);
        require(isVerified,"arbiter is not in the list !");

        if(!_isJobIdInArray(_jobId)){
          oracles.push(_oracle);
          jobIds.push(_jobId);
        }
    }

    function _isJobIdInArray(string memory _jobId) internal view returns (bool){

      uint256 jobIdLength = oracles.length;

      for(uint256 i = 0 ;i < jobIdLength ;i ++ ){
        
        if(_compareString(jobIds[i], _jobId)){
          return true;
        }
      
      }

      return false;  
    
    }

    function _compareString(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function clearOralceAndJobId() onlyOwner external {

      delete oracles;
      delete jobIds;

    }

    function getOralceAndJobs() external view returns(address[] memory ,string[] memory){
      return (oracles,jobIds);  
    }

    function requestResultFromList(string memory did,string memory method)
      public {
      
      emit Log(bytes32(0),0);
      id ++ ;
      
      //is search result in list
      //if(_isInChannelist(did,method)) return;
      
      uint len = oracles.length;

      // uint channelNum = _getCurChannelNum();
      uint channelNum = (id - 1) % 20;
      require(channelInfoList[channelNum].status != 1,"to many calls,please wait ");

      //set channel info 
      channelInfoList[channelNum].did = did;
      channelInfoList[channelNum].method = method;
      channelInfoList[channelNum].status = 1;

      for(uint i = 0 ;i < len ; i ++){

        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(jobIds[i]), 
            address(this), 
            this.fulfillEthereumDidData.selector
        );
        
        req.add("did", did);
        req.addUint("id", id);
        req.add("method", method);
        req.add("path", "result,transaction");

        //set request info
        channelInfoList[channelNum].requestInfoList[i].requestId = sendOperatorRequestTo(
            oracles[i], 
            req, 
            ORACLE_PAYMENT
        );

        emit Log(channelInfoList[channelNum].requestInfoList[i].requestId,1);
        channelInfoList[channelNum].requestInfoList[i].isSearched = false;
        emit SearchInfo(channelInfoList[channelNum].requestInfoList[i].requestId,did);

      }

      

    }

    // function _getCurChannelNum() internal view returns(uint256){

    //   //first look at idle list
    //   for(uint i = 0 ;i < MAX_CHANNEL ;i ++){
    //     if(channelInfoList[i].status == 0){
    //       return i;
    //     }
    //   }

    //   //then look at finish list
    //   for(uint i = 0 ;i < MAX_CHANNEL ;i ++){
    //     if(channelInfoList[i].status == 2){
    //       return i;
    //     }
    //   }

    //   //no idea channel for use  
    //   return MAX_CHANNEL + 1;
    // }

    function _isInChannelist(string memory did,string memory method) internal view returns(bool){

      for(uint i = 0 ;i < MAX_CHANNEL ;i ++){
        if(_compareString(did,channelInfoList[i].did) && _compareString(method,channelInfoList[i].method)){
          return true;
        }
      }

      return false;
    }

    function fulfillEthereumDidData(bytes32 _requestId, bytes memory _didData) public recordChainlinkFulfillment(_requestId){

      emit Log(_requestId,2);
      uint256 channelNum = _getChannelNumberFormRequestId(_requestId);

      bytes32 dataHash = keccak256(_didData);
      if(channelInfoList[channelNum].status == 1){

        emit Log(_requestId,3);
        if(channelInfoList[channelNum].dataHash == bytes32(0)){

          emit Log(_requestId,4);
          // channelInfoList[channelNum].data = _didData;
          channelInfoList[channelNum].dataHash = dataHash;
          _setRequestInfo(channelNum,_requestId);
        }else if(channelInfoList[channelNum].dataHash == dataHash){
          emit Log(_requestId,5);
          _setRequestInfo(channelNum,_requestId);
        }

        _runSearchResult(_requestId,channelNum,_didData,dataHash);

      }

    }

    function _setRequestInfo(uint256 _channelNum,bytes32 _requestId) internal{

      emit Log(_requestId,6);
      for(uint i = 0 ;i < ARBITER_NUM ;i ++){
         
         if(channelInfoList[_channelNum].requestInfoList[i].requestId == _requestId){
          channelInfoList[_channelNum].requestInfoList[i].isSearched = true;
          channelInfoList[_channelNum].dataHash = bytes32(0);
         }
      }

    }

    function _runSearchResult(bytes32 _requestId,uint256 _channelNum,bytes memory _didData,bytes32 _dataHash) internal {

      if(_getHitTotalFromChannelNum(_channelNum) * 3 >= ARBITER_NUM * 2){
          emit SearchConformed(_requestId, _didData,block.number,_dataHash);
          channelInfoList[_channelNum].status = 2;

        }
    }


    function _getHitTotalFromChannelNum(uint256 _channelNum) internal view returns(uint8){

      uint8 totalHitNum = 0 ; 
      for(uint i = 0 ;i < ARBITER_NUM ;i ++){
         if(channelInfoList[_channelNum].requestInfoList[i].isSearched){
           totalHitNum ++ ;
         }
      }

      return totalHitNum;

    }

    function _getChannelNumberFormRequestId(bytes32 _requestId) internal view returns(uint256){

      for(uint i = 0 ; i < MAX_CHANNEL ;i ++){

        for(uint j = 0 ;j < ARBITER_NUM ; j ++){
          if(channelInfoList[i].requestInfoList[j].requestId == _requestId){
            return i;
          }
        }

      }
      return 0;

    }


  function getSearchResult(string memory _did,string memory _method) external view returns(bytes32){

     for(uint i = 0 ;i < MAX_CHANNEL ;i ++){
      if(_compareString(_did,channelInfoList[i].did) && 
         _compareString(_method,channelInfoList[i].method) &&  
         channelInfoList[i].status == 2 ){
          return channelInfoList[i].dataHash;
      }
     }
     return "";
  }

  function getChannelInfoList() external view returns( ChannelInfo[MAX_CHANNEL] memory) {
    return channelInfoList;
  }

  function clearSearchResult() external {
      id = 0;
      _initChannelInfoList();
  }

}
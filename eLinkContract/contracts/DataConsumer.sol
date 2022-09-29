// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;
import "./chainlink/ChainlinkClient.sol";
import "./bytesUtils/BytesLib.sol";

import "./Arbiter.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DataConsumer is ChainlinkClient,Initializable,OwnableUpgradeable,Arbiter{

    // uint256 constant public maxChannel = 20;
    uint256 constant private ORACLE_PAYMENT = 0;

    using Chainlink for Chainlink.Request;

    address[] private oracles;
    string[]  private jobIds;
    string    private version;
    uint256   private id;
    
    // struct RequestInfo{
    //   bytes32 requestId;
    //   bool isSearched;
    // }
    mapping(bytes32=>bool) RequestIdIsSearchMap;

    struct ChannelInfo {
        string did;
        string method;
        uint8 status; //0: idle 1:searching 2:finish
        bytes32 dataHash;
        uint8 totalReqestNum;
        //mapping(bytes32=>bool) requestIdIsSearchMap;
        bytes32[ARBITER_NUM] requestIds;
        bool[ARBITER_NUM] isSearchs;

        //bytes data;
        // RequestInfo[ARBITER_NUM] requestInfoList;

    }
    // ChannelInfo[maxChannel] private channelInfoList;

    mapping( string => address) jobIdReceiverMap;
    uint256 platformRate;
    mapping( uint256 => mapping( bytes32 => string) )chanelNumRequestIdJobIdMap;
    bool isLocked;

    ChannelInfo[] private channelInfoList;
    uint256 fee;
    uint256 maxChannel;

    using SafeMath for uint;
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

    event LogAddress(
      address recAddress,
      uint256 value
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

        platformRate = 0;
        fee = 0 ;
        maxChannel = 0;
    }

    function createMaxChannel(uint256 _maxChannel) external onlyOwner{
      
      id = 0;
      delete channelInfoList;

      //maxChannel = _maxChannel;
      //channelInfoList = new ChannelInfo(_maxChannel);

      maxChannel = _maxChannel;
      for(uint256 i = 0 ;i < maxChannel ;i ++){
          ChannelInfo memory curChannelInfo;

          curChannelInfo.did = "";
          curChannelInfo.method = "";
          curChannelInfo.status = 0;
          curChannelInfo.dataHash = bytes32(0);
  
          // for(uint i = 0 ; i <  ARBITER_NUM; i ++ ){
          //   curChannelInfo.requestIds[i] = bytes32(0);
          //   curChannelInfo.isSearchs[i] = false;
          // }
          channelInfoList.push(curChannelInfo);
      }

    }

    function getMaxChannel() public view returns(uint256){
      
      return maxChannel ;



    }
    
    function setPlatformRate(uint256 _platformRate) public onlyOwner{
      platformRate = _platformRate;
    }

    function getPlatformRate() public view returns(uint256){
      return platformRate ;
    }

    function setFee(uint256 _fee) public onlyOwner{
      fee = _fee;
    }

    function getFee() public view returns(uint256){
      return fee ;
    }

    function _initChannelInfoList() internal {

      for(uint i = 0 ;i < maxChannel ;i ++ ){
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
          channelInfoList[_channelNum].requestIds[i] = bytes32(0);
          channelInfoList[_channelNum].isSearchs[i] = false;
        }

    }

    function addOralceAndJobId(
        address _oracle,
        string memory _jobId,
        string memory _pubKey,
        string memory _sign,
        address _receiveAddress
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

        jobIdReceiverMap[_jobId] = _receiveAddress;
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

    function requestResultFromList(string memory did,string memory method) public payable{
      
      require(msg.value >= fee,"fee is not enough");

      emit Log(bytes32(0),0);
      id ++ ;
      
      uint len = oracles.length;
      uint channelNum = (id - 1) % maxChannel;
      require(channelInfoList[channelNum].status != 1,"too many calls,please wait ");

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
        req.add("id", uint2str(id));
        req.add("method", method);
        req.add("path", "result,transaction");

        // set request info
        channelInfoList[channelNum].requestIds[i] = sendOperatorRequestTo(
            oracles[i], 
            req, 
            ORACLE_PAYMENT
        );
        
        emit Log(channelInfoList[channelNum].requestIds[i],1);

        channelInfoList[channelNum].isSearchs[i] = false;
        emit SearchInfo(channelInfoList[channelNum].requestIds[i],did);

        chanelNumRequestIdJobIdMap[channelNum][channelInfoList[channelNum].requestIds[i]] = jobIds[i];


      }

    }

    function fulfillEthereumDidData(bytes32 _requestId, bytes memory _didData) public recordChainlinkFulfillment(_requestId){

      emit Log(_requestId,2);
      uint256 channelNum = _getChannelNumberFormRequestId(_requestId);

      bytes32 dataHash = keccak256(_didData);
      if(channelInfoList[channelNum].status == 1){

        //emit Log(_requestId,3);
        if(channelInfoList[channelNum].dataHash == bytes32(0)){

          //emit Log(_requestId,4);
          // channelInfoList[channelNum].data = _didData;
          channelInfoList[channelNum].dataHash = dataHash;
          // _setRequestInfo(channelNum,_requestId);
        }else if(channelInfoList[channelNum].dataHash == dataHash){
          // emit Log(_requestId,5);
          // _setRequestInfo(channelNum,_requestId);
        }

        // _runSearchResult(_requestId,channelNum,_didData,dataHash);

      }

    }

    function _setRequestInfo(uint256 _channelNum,bytes32 _requestId) internal{

      // emit Log(_requestId,6);
      for(uint i = 0 ;i < ARBITER_NUM ;i ++){
         
         if(channelInfoList[_channelNum].requestIds[i] == _requestId){
          channelInfoList[_channelNum].isSearchs[i] = true;
          channelInfoList[_channelNum].dataHash = bytes32(0);
          
         }
      }

    }

    function _distributeFee(uint256 _channelNum) internal{

      // uint256 payLen = channelInfoList[_channelNum].requestInfoList.length/3*2；
      uint256 value = fee.mul(10000 - platformRate).div(10000).div(ARBITER_NUM/3*2);
      for(uint i = 0 ;i < ARBITER_NUM ;i ++){
        
        if(channelInfoList[_channelNum].isSearchs[i]){

            bytes32 requestId = channelInfoList[_channelNum].requestIds[i];
            string memory jobId = chanelNumRequestIdJobIdMap[_channelNum][requestId];
            address toAddress = jobIdReceiverMap[jobId];

            emit LogAddress(toAddress,value);
            _safeTransferCurrency(toAddress,value);

        }

      }

    }


    function _runSearchResult(bytes32 _requestId,uint256 _channelNum,bytes memory _didData,bytes32 _dataHash) internal {

      if(_getHitTotalFromChannelNum(_channelNum) * 3 >= ARBITER_NUM * 2){
          emit SearchConformed(_requestId, _didData,block.number,_dataHash);
          channelInfoList[_channelNum].status = 2;
          _distributeFee(_channelNum);

        }
    }


    function _getHitTotalFromChannelNum(uint256 _channelNum) internal view returns(uint8){

      uint8 totalHitNum = 0 ; 
      for(uint i = 0 ;i < ARBITER_NUM ;i ++){
         if(channelInfoList[_channelNum].isSearchs[i]){
           totalHitNum ++ ;
         }
      }

      return totalHitNum;

    }

    function _getChannelNumberFormRequestId(bytes32 _requestId) internal view returns(uint256){

      for(uint i = 0 ; i < maxChannel ;i ++){

        for(uint j = 0 ;j < ARBITER_NUM ; j ++){
          if(channelInfoList[i].requestIds[j] == _requestId){
            return i;
          }
        }

      }
      return 0;

    }


  function getSearchResult(string memory _did,string memory _method) external view returns(bytes32){

     for(uint i = 0 ;i < maxChannel ;i ++){
      if(_compareString(_did,channelInfoList[i].did) && 
         _compareString(_method,channelInfoList[i].method) &&  
         channelInfoList[i].status == 2 ){
          return channelInfoList[i].dataHash;
      }
     }
     return "";
  }

  function getChannelInfoList() external view returns( ChannelInfo[] memory) {
    return channelInfoList;
  }

  function clearSearchResult() external {
      id = 0;
      _initChannelInfoList();
  }


  function _safeTransferCurrency(address _to, uint256 _value) public {

      (bool success, ) = _to.call{value: _value}(new bytes(0));

      require(
          success,
          "TransferHelper::safeTransferCurrency: Currency transfer failed"
      );
  }

  function withDrawCurrency() onlyOwner public {
    
    payable(msg.sender).transfer(address(this).balance);
  
  }

  function setPayMap(string memory _jobId,address _receiveAddress) onlyOwner public {
    
     jobIdReceiverMap[_jobId] = _receiveAddress;
  
  }

  function getPayMap(string memory _jobId) public view returns(address){
    
     return jobIdReceiverMap[_jobId];
  
  }

  fallback() external payable{}
  receive() external payable {}

function uint2str( uint256 _i )
  internal
  pure
  returns (string memory str)
{
      if (_i == 0)
      {
        return "0";
      }
      uint256 j = _i;
      uint256 length;
      while (j != 0)
      {
        length++;
        j /= 10;
      }
      bytes memory bstr = new bytes(length);
      uint256 k = length;
      j = _i;
      while (j != 0)
      {
        bstr[--k] = bytes1(uint8(48 + j % 10));
        j /= 10;
      }
      str = string(bstr);
}

}
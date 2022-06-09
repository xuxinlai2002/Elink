// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "hardhat/console.sol";

/**
 * @title Arbiter
 * @dev A super simple ERC20 implementation!
 */
contract Arbiter {

    uint256 constant public ARBITER_NUM = 1;

    function isArbiterInList(bytes32 arbiter)internal view returns (bool){

        bytes32[ARBITER_NUM] memory arbiterList = getArbiterList();

        for(uint i = 0 ;i < ARBITER_NUM ;i ++){

            if(arbiter == arbiterList[i]){
                return true;
            }
        }

        return false;

    }

    function getArbiterList() public view returns( bytes32[ARBITER_NUM] memory){

        bytes32[ARBITER_NUM] memory p;
        uint  input;
        assembly {
            if iszero(staticcall(gas(), 20, input, 0x00, p, 96)) {
                revert(0,0)
            }
        }
        return p;

    }

    function p256Verify(string memory _pubkey, string memory  _data, string memory _sig) public view returns(bool){
        
        string memory strInput = strConcat(strConcat(_pubkey, _data), _sig);
        bytes memory input = hexStr2bytes(strInput);
        uint256[1] memory p;

        assembly {
            if iszero(staticcall(gas(), 21, input, 193, p, 0x20)) {
                revert(0,0)
            }
        }

        return p[0] == 1;
    }

    function strConcat(string memory _a, string memory _b) internal pure returns (string memory){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory ret = new string(_ba.length + _bb.length);
        bytes memory bret = bytes(ret);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++)bret[k++] = _ba[i];
        for (uint i = 0; i < _bb.length; i++) bret[k++] = _bb[i];
        return string(ret);
    }

    function hexStr2bytes(string memory _data) internal pure returns (bytes memory){
    
        bytes memory a = bytes(_data);
        uint8[] memory b = new uint8[](a.length);

        for (uint i = 0; i < a.length; i++) {
            uint8 _a = uint8(a[i]);

            if (_a > 96) {
                b[i] = _a - 97 + 10;
            }
            else if (_a > 66) {
                b[i] = _a - 65 + 10;
            }
            else {
                b[i] = _a - 48;
            }
        }

        bytes memory c = new bytes(b.length / 2);
        for (uint _i = 0; _i < b.length; _i += 2) {
            c[_i / 2] = byte(b[_i] * 16 + b[_i + 1]);
        }

        return c;
    }

    function addressToString(address _addr) internal pure returns (string memory) {

        bytes memory addresssBytes = abi.encodePacked(_addr);
        bytes memory stringBytes = new bytes(40);
        stringBytes = bytesToString(addresssBytes,20);

        return string(stringBytes);

    }

    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        

        bytes memory addresssBytes = abi.encodePacked(_bytes32);
        bytes memory stringBytes = new bytes(64);
        stringBytes = bytesToString(addresssBytes,32);

        return string(stringBytes);

    }

    function bytesToString(bytes memory addresssBytes,uint len) internal pure returns (bytes memory) {

        bytes memory stringBytes = new bytes(len * 2);
        for(uint i = 0; i < len ;i ++){
            uint8 leftValue = uint8(addresssBytes[i]) / 16 ;
            uint8 rightValue = uint8(addresssBytes[i]) - 16 * leftValue  ;

            bytes1 leftChar  = leftValue  < 10 ? bytes1(leftValue  + 48) : bytes1(leftValue  + 87);
            bytes1 rightChar = rightValue < 10 ? bytes1(rightValue + 48) : bytes1(rightValue + 87);

            stringBytes[2*i ] = leftChar;
            stringBytes[2*i + 1] = rightChar;

        }

        return stringBytes;

    }


    function stringToBytes32(string memory _source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(_source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly { 
            result := mload(add(_source, 32))
        }
    }

}
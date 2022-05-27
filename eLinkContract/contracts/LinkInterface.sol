// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LinkInterface
 * @dev A super LinkInterface implementation!
 */
contract LinkInterface is Ownable{

    address private _linkAddress;
     /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor()public {}

    /**
     * @dev set link address for mint right
       @param linkAddress linkAddress of contract 
     */
    function setAddress(address linkAddress) external onlyOwner{
        _linkAddress = linkAddress;
    }

    function getAddress() view external returns(address){
        return _linkAddress;
    }

    
       




}
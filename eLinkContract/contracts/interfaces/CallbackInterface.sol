// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;


interface CallbackInterface {

  function callbackResult(bytes32,bytes memory) external;
  // function callbackResult2(bytes memory) external;
  
}

pragma solidity ^0.7.6;

interface IERC677Receiver {
  function onTokenTransfer(
    address sender,
    uint value,
    bytes memory data
  )
    external;
}

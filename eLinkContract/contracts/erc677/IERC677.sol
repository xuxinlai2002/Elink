// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC677 is IERC20 {
  function transferAndCall(
    address to,
    uint256 value,
    bytes memory data
  ) external returns (bool ok);

  event Transfer(address indexed from, address indexed to, uint256 value, bytes data);
}

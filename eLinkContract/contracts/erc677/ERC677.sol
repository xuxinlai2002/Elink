// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC677.sol";
import "./IERC677Receiver.sol";

import "hardhat/console.sol";

contract ERC677 is IERC677, ERC20 {
  constructor(
    address initialAccount,
    uint256 initialBalance,
    string memory tokenName,
    string memory tokenSymbol
  ) ERC20(tokenName, tokenSymbol) {
    _mint(initialAccount, initialBalance);
  }

  /**
   * ERC-677's only method implementation
   * See https://github.com/ethereum/EIPs/issues/677 for details
   */
  function transferAndCall(
    address _to,
    uint256 _value,
    bytes memory _data
  ) external override returns (bool) {

    super.transfer(_to, _value);
    Transfer(msg.sender, _to, _value, _data);
    if (isContract(_to)) {
      contractFallback(_to, _value, _data);
    }
    return true;

  }

  function contractFallback(address _to, uint _value, bytes memory _data)
    private
  {

    IERC677Receiver receiver = IERC677Receiver(_to);
    receiver.onTokenTransfer(msg.sender, _value, _data);
  }

  function isContract(address _addr)
    private
    returns (bool hasCode)
  {
    uint length;
    assembly { length := extcodesize(_addr) }
    return length > 0;
  }
  

}

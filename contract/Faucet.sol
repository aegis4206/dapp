// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Faucet {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
    receive() external payable { }

    function requestTokens() external {
        uint256 amount = 1 ether;
        require(address(this).balance >= amount, "Faucet is empty");
        payable(msg.sender).transfer(amount);
    }
}

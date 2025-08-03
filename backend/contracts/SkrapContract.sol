// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract SkrapContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error InvalidRecipient();
    error InvalidToken();
    error InvalidAmount();
    error ETHTransferFailed();
    error ERC20TransferFailed();

    event NativeSent(address indexed from, address indexed to, uint256 amount);
    event ERC20Sent(address indexed from, address indexed to, address indexed token, uint256 amount);

    // Constructor to set the initial owner
    constructor() Ownable(msg.sender) {}
    // Allows user to send ETH from their own wallet
    function sendNative(address payable to) external payable nonReentrant {
        if (to == address(0)) revert InvalidRecipient();
        if (msg.value == 0) revert InvalidAmount();

        (bool sent, ) = to.call{value: msg.value}("");
        if (!sent) revert ETHTransferFailed();

        emit NativeSent(msg.sender, to, msg.value);
    }

    // Allows user to send ERC20 tokens from their own wallet
    function sendERC20(address token, address to, uint256 amount) external nonReentrant {
        if (token == address(0)) revert InvalidToken();
        if (to == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, to, amount);
        emit ERC20Sent(msg.sender, to, token, amount);
    }

    // Let contract receive ETH (e.g., refund, accidental sends)
    receive() external payable {}
}

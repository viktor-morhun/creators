// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC721Mock {
    string public name;
    string public symbol;
    mapping(uint256 => address) public ownerOf;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => address) public getApproved;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function mint(address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == address(0), "Token already minted");
        ownerOf[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    function approve(address approved, uint256 tokenId) public {
        require(ownerOf[tokenId] == msg.sender, "Not owner");
        getApproved[tokenId] = approved;
        emit Approval(msg.sender, approved, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == from, "Not owner");
        require(getApproved[tokenId] == msg.sender || from == msg.sender, "Not approved or owner");
        ownerOf[tokenId] = to;
        delete getApproved[tokenId];
        emit Transfer(from, to, tokenId);
    }
}
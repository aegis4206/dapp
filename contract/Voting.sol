// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;

    bytes32[] public candidateKeys;
    mapping(bytes32 => string) public nameOf;
    mapping(bytes32 => uint256) public votes;
    mapping(bytes32 => bool) public candidateExists;

    // mapping(address => bool) public hasVoted;

    event Voted(
        address indexed voter,
        bytes32 indexed candidateKey,
        string candidateName,
        uint256 totalVotes
    );

    modifier onlyOwner() {
        require(msg.sender == owner, unicode"只有擁有者可以執行");
        _;
    }

    constructor(string[] memory _candidates) {
        owner = msg.sender;
        for (uint256 i = 0; i < _candidates.length; i++) {
            _addCandidateInternal(_candidates[i]);
        }
    }

    function _addCandidateInternal(string memory candidate) internal {
        bytes memory candidateBytes = bytes(candidate);
        require(candidateBytes.length > 0, unicode"名稱不可為空");

        bytes32 key = keccak256(abi.encodePacked(candidate));
        require(!candidateExists[key], unicode"候選人已存在");

        candidateKeys.push(key);
        nameOf[key] = candidate;
        votes[key] = 0;
        candidateExists[key] = true;
    }

    function addCandidate(string memory candidate) external onlyOwner {
        _addCandidateInternal(candidate);
    }

    function vote(string memory candidate) external {
        bytes32 key = keccak256(abi.encodePacked(candidate));
        require(candidateExists[key], unicode"查無此候選人");
        // require(!hasVoted[msg.sender], "Already voted");

        // hasVoted[msg.sender] = true;
        votes[key] += 1;

        emit Voted(msg.sender, key, candidate, votes[key]);
    }

    function voteByKey(bytes32 candidateKey) external {
        require(candidateExists[candidateKey], unicode"查無此key");
        // require(!hasVoted[msg.sender], "Already voted");

        // hasVoted[msg.sender] = true;
        votes[candidateKey] += 1;

        emit Voted(msg.sender, candidateKey, nameOf[candidateKey], votes[candidateKey]);
    }

    function getCandidateKeys() external view returns (bytes32[] memory) {
        return candidateKeys;
    }

    function getCandidates() external view returns (string[] memory) {
        uint256 n = candidateKeys.length;
        string[] memory candidateNameArr = new string[](n);
        for (uint256 i = 0; i < n; i++) {
            candidateNameArr[i] = nameOf[candidateKeys[i]];
        }
        return candidateNameArr;
    }

    function getWinner()
        external
        view
        onlyOwner
        returns (string memory winnerName, uint256 winnerVotes)
    {
        uint256 highest = 0;
        bytes32 bestKey = bytes32(0);

        for (uint256 i = 0; i < candidateKeys.length; i++) {
            bytes32 k = candidateKeys[i];
            uint256 v = votes[k];
            if (v > highest) {
                highest = v;
                bestKey = k;
            }
        }

        if (bestKey == bytes32(0)) {
            return ("", 0);
        } else {
            return (nameOf[bestKey], highest);
        }
    }
}

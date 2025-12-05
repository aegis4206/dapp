import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Web3, { Contract } from "web3";
import type { AbiItem, EventLog } from "web3";


const votingAddress = "0x4F8c296e6E2f218D9B90fDdcc89D29A9Ce506485";
const votingABI: AbiItem[] = [
    {
        "inputs": [
            {
                "internalType": "string[]",
                "name": "_candidates",
                "type": "string[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "candidateKey",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "candidateName",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalVotes",
                "type": "uint256"
            }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "candidateExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidateKeys",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidateKeys",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidates",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWinner",
        "outputs": [
            {
                "internalType": "string",
                "name": "winnerName",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "winnerVotes",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "nameOf",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "candidateKey",
                "type": "bytes32"
            }
        ],
        "name": "voteByKey",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "votes",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export default function Voting() {
    const [account, setAccount] = useState<string>("");
    const [status, setStatus] = useState<string>("尚未連線");
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
    const [voteLogs, setVoteLogs] = useState<EventLog[]>([]);
    const [candidates, setCandidates] = useState<string[]>([]);
    // const [candidatesKey, setCandidatesKey] = useState<string[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<string>("");
    const [winnerCandidate, setWinnerCandidate] = useState<string>("");

    // 連接 MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = window.ethereum;
                await provider.request({ method: "eth_requestAccounts" });
                const web3Instance = new Web3(provider);
                setWeb3(web3Instance);

                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const contractInstance = new web3Instance.eth.Contract(votingABI, votingAddress);
                setContract(contractInstance);

                const candidates: string[] = await contractInstance.methods.getCandidates().call();
                setCandidates(candidates);
                // const candidatesKey = await contractInstance.methods.getCandidateKeys().call();
                // setCandidatesKey(candidatesKey as string[]);
                setSelectedCandidate(candidates[0] || "");

                setStatus("已連接 MetaMask");
            } catch (error) {
                console.error(error);
                setStatus("連線失敗");
            }
        } else {
            setStatus("請先安裝 MetaMask");
        }
    };

    const getVoteLogs = async () => {
        if (!contract || !web3) return;
        const pastEvents = await contract.getPastEvents("allEvents", {
            fromBlock: 0,   // 從創世區塊開始
            toBlock: "latest"
        });
        const even = (pastEvents as EventLog[]);
        // .map(log => {
        //     return {
        //         ...log,
        //         returnValues: {
        //             ...log.returnValues,
        //         }
        //     };
        // });
        console.log(even)
        setVoteLogs(even);
    }

    useEffect(() => {
        getVoteLogs();
    }, [contract, web3]);

    const sendVotes = async () => {
        if (!contract || !account) {
            setStatus("請先連接 MetaMask");
            return;
        }
        try {
            setStatus("投票中...");
            await contract.methods.vote(selectedCandidate).send({ from: account });
            setStatus("投票成功！");
        } catch (error) {
            console.error(error);
            setStatus("投票失敗");
        }
    };

    const getWinner = async () => {
        if (!contract || !account) return;
        const winner: Record<string, string> = await contract.methods.getWinner().call({ from: account });
        console.log(winner)
        setWinnerCandidate((winner.winnerName ?? "") + " (" + (winner.winnerVotes ?? "0") + "票)");
    }

    return (
        <Box>
            <Typography variant="h5" className="!mb-4">Voting</Typography>
            <Typography className="!mb-2">帳號: {account || "尚未連接"}</Typography>
            <Typography className="!mb-4">狀態: {status}</Typography>
            <Typography className="!mb-4">候選人: {candidates.join(", ")}</Typography>
            <Box className="mb-4">
                <Button
                    onClick={connectWallet}
                    variant="contained"
                    color="primary"
                    className="!mr-4"
                >
                    連接 MetaMask
                </Button>
                <Button
                    onClick={getWinner}
                    variant="contained"
                    color="secondary"
                >
                    取得結果
                </Button>
                <Typography className="!mt-2">得票最高的候選人: {winnerCandidate || "尚未取得"}</Typography>
            </Box>
            <Box>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedCandidate}
                    label="候選人"
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                >
                    {candidates.map((candidate, index) => (
                        <MenuItem key={index} value={candidate}>
                            {candidate}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    onClick={sendVotes}
                    variant="contained"
                    color="warning"
                    className="!ml-4"
                >
                    投票
                </Button>
            </Box>
            <Box sx={{ maxHeight: "400px", overflowY: "auto", marginTop: "20px" }}>
                {voteLogs.map((log, index) => (
                    <Box key={index} sx={{ border: "1px solid #fff", padding: "10px", marginBottom: "10px" }}>
                        <Typography variant="body2">
                            address from: {String(log.returnValues?.[0] ?? "")}
                        </Typography>
                        <Typography variant="body2">
                            vote target key: {String(log.returnValues?.[1] ?? "")}
                        </Typography>
                        <Typography variant="body2">
                            vote candidate name: {String(log.returnValues?.candidateName ?? "")}
                        </Typography>
                        <Typography variant="body2">
                            totalVotes: {String(log.returnValues?.totalVotes ?? "")}
                        </Typography>
                    </Box>
                ))
                }
            </Box >
        </Box >
    );
}

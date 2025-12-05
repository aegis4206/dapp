import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Web3, { Contract } from "web3";
import type { AbiItem, EventLog, Numbers } from "web3";


const faucetAddress = "0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44";
const faucetABI: AbiItem[] = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "initialSupply",
                "type": "uint256"
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
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
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
        "name": "symbol",
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
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default function WhiteToken() {
    const [account, setAccount] = useState<string>("");
    const [status, setStatus] = useState<string>("尚未連線");
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
    const [balance, setBalance] = useState<string>("");
    const [recipient, setRecipient] = useState<string>("");
    const [amount, setAmount] = useState<string>("0");
    const [pastLogs, setPastLogs] = useState<EventLog[]>([]);
    const [totalSupply, setTotalSupply] = useState<string>("");

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
                // 合約持有人地址
                // setAccount("0x71562b71999873DB5b286dF957af199Ec94617F7");

                const contractInstance = new web3Instance.eth.Contract(faucetABI, faucetAddress);
                setContract(contractInstance);

                const totalSupply = await contractInstance.methods.totalSupply().call();
                setTotalSupply(web3Instance.utils.fromWei(totalSupply as unknown as string, "ether"));

                setStatus("已連接 MetaMask");
            } catch (error) {
                console.error(error);
                setStatus("連線失敗");
            }
        } else {
            setStatus("請先安裝 MetaMask");
        }
    };

    const getPastLog = async () => {
        if (!contract || !web3) return;
        const pastEvents = await contract.getPastEvents("allEvents", {
            fromBlock: 0,   // 從創世區塊開始
            toBlock: "latest"
        });
        // console.log(pastEvents);
        const even = (pastEvents as EventLog[]).map(log => {
            return {
                ...log,
                returnValues: {
                    ...log.returnValues,
                    value: web3.utils.fromWei(String(log.returnValues?.value ?? "0"), "ether")
                }
            };
        });
        setPastLogs(even);
    }

    useEffect(() => {
        getPastLog();
    }, [contract, web3]);

    const fetchBalance = async (user: string) => {
        if (!contract || !user || !web3) return;
        const rawBalance: Numbers = await contract.methods.balanceOf(user).call();
        // const decimals = await contract.methods.decimals().call();
        setBalance(web3.utils.fromWei(rawBalance, "ether"));
    };

    const getBalance = async () => {
        if (!contract || !account) {
            setStatus("請先連接 MetaMask");
            return;
        }
        try {
            setStatus("WTK查詢中...");
            await fetchBalance(account);
            setStatus("查詢成功！");
        } catch (error) {
            console.error(error);
            setStatus("查詢失敗");
        }
    };

    const sendTokens = async () => {
        if (!contract || !account) {
            setStatus("請先連接 MetaMask");
            return;
        }
        try {
            setStatus("發送交易中...");
            await contract.methods.transfer(recipient, Web3.utils.toWei(amount, "ether")).send({ from: account });
            setStatus("轉帳成功！");
            await fetchBalance(account);
        } catch (error) {
            console.error(error);
            setStatus("轉帳失敗");
        }
    };

    return (
        <Box>
            <Typography variant="h5" className="!mb-4">White Token</Typography>
            <Typography className="!mb-2">帳號: {account || "尚未連接"}</Typography>
            <Typography className="mb-2">餘額: {balance} MTK</Typography>
            <Typography className="!mb-4">狀態: {status}</Typography>
            <Typography className="!mb-4">總數: {totalSupply} MTK</Typography>
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
                    onClick={getBalance}
                    variant="contained"
                    color="secondary"
                >
                    取得餘額
                </Button>

            </Box>
            <Box>
                <TextField
                    type="text"
                    placeholder="收款地址"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="!mr-2"
                    size="small"
                />
                <TextField
                    type="text"
                    placeholder="數量 (ETH)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="!mr-2"
                    size="small"
                />
                <Button
                    onClick={sendTokens}
                    variant="contained"
                    color="warning"
                >
                    發送代幣
                </Button>
            </Box>
            <Box sx={{ maxHeight: "400px", overflowY: "auto", marginTop: "20px" }}>
                {pastLogs.map((log, index) => (
                    <Box key={index} sx={{ border: "1px solid #fff", padding: "10px", marginBottom: "10px" }}>
                        <Typography variant="body2">
                            address from: {String(log.returnValues?.[0] ?? "")}
                        </Typography>
                        <Typography variant="body2">
                            address to: {String(log.returnValues?.[1] ?? "")}
                        </Typography>
                        <Typography variant="body2">
                            value: {String(log.returnValues?.value ?? "")}
                        </Typography>
                    </Box>
                ))
                }
            </Box >
        </Box >
    );
}

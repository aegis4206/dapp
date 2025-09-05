import type { MetaMaskInpageProvider } from "@metamask/providers";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Web3, { Contract } from "web3";
import type { AbiItem } from "web3";


declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider;
    }
}

const faucetAddress = "0x3A220f351252089D385b29beca14e27F204c296A";
const faucetABI: AbiItem[] = [
    {
        "inputs": [],
        "name": "requestTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export default function Faucet() {
    const [account, setAccount] = useState<string>("");
    const [status, setStatus] = useState<string>("尚未連線");
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [contract, setContract] = useState<Contract<AbiItem[]> | null>(null);
    const [faucetBalance, setFaucetBalance] = useState<string>("0");

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

                const contractInstance = new web3Instance.eth.Contract(faucetABI, faucetAddress);
                setContract(contractInstance);

                setStatus("已連接 MetaMask");
            } catch (error) {
                console.error(error);
                setStatus("連線失敗");
            }
        } else {
            setStatus("請先安裝 MetaMask");
        }
    };

    // 呼叫水龍頭
    const getTokens = async () => {
        if (!contract || !account) {
            setStatus("請先連接 MetaMask");
            return;
        }
        try {
            setStatus("發送交易中...");
            await contract.methods.requestTokens().send({ from: account });
            setStatus("領幣成功！");
        } catch (error) {
            console.error(error);
            setStatus("領幣失敗");
        }
    };

    const getFaucetBalance = async () => {
        if (!web3) return;
        const balance = await web3.eth.getBalance(faucetAddress);
        return web3.utils.fromWei(balance, "ether");
    };

    useEffect(() => {
        const fetchFaucetBalance = async () => {
            const balance = await getFaucetBalance();
            setFaucetBalance(balance ?? "0");
        };
        fetchFaucetBalance();
    }, [web3]);

    return (
        <Box>
            <Typography variant="h5" className="!mb-4">Dev Faucet</Typography>
            <Typography className="!mb-2">帳號: {account || "尚未連接"}</Typography>
            <Typography className="!mb-4">狀態: {status}</Typography>
            <Box>
                <Button
                    onClick={connectWallet}
                    variant="contained"
                    color="primary"
                    className="!mr-4"
                >
                    連接 MetaMask
                </Button>
                <Button
                    onClick={getTokens}
                    variant="contained"
                    color="secondary"
                >
                    領取 1 ETH (剩餘{faucetBalance} ETH)
                </Button>
            </Box>
        </Box>
    );
}

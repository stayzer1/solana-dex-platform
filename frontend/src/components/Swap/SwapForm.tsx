import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
    Snackbar,
    Alert,
} from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createSwapTransaction } from "../../utils/swap";

import { TokenSelectModal } from "./TokenSelectModal";
import { useTokenPrices } from "../../hooks/useTokenPrice";
import { useTokens } from "../../hooks/useTokens";

export const SwapForm = () => {
    const [fromAmount, setFromAmount] = useState("");
    const [toAmount, setToAmount] = useState("");
    const [fromToken, setFromToken] = useState<string>(
        "So11111111111111111111111111111111111111112"
    );
    const [toToken, setToToken] = useState<string>(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );
    const [tokenSelectModalOpen, setTokenSelectModalOpen] = useState(false);
    const [selectingTokenFor, setSelectingTokenFor] = useState<
        "from" | "to" | null
    >(null);
    const { tokens, loading: tokensLoading } = useTokens();
    const { prices, loading: pricesLoading } = useTokenPrices(
        tokens.map((token) => token.symbol)
    );
    const [isSwapping, setIsSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [swapLoading, setSwapLoading] = useState(false);
    const { publicKey, signTransaction } = useWallet();
    const [tokenBalances, setTokenBalances] = useState<{
        [key: string]: number;
    }>({});
    const connection = new Connection(
        process.env.REACT_APP_RPC_URL || "https://api.mainnet-beta.solana.com"
    );

    const fetchTokenBalances = useCallback(async () => {
        if (!publicKey) return;

        try {
            // Получаем баланс SOL
            const solBalance = await connection.getBalance(publicKey);
            const balances: { [key: string]: number } = {
                So11111111111111111111111111111111111111112: solBalance / 1e9,
            };

            // Получаем балансы SPL токенов
            const tokenAccounts =
                await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                });

            tokenAccounts.value.forEach((accountInfo) => {
                const tokenAddress = accountInfo.account.data.parsed.info.mint;
                const balance =
                    accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
                balances[tokenAddress] = balance;
            });

            setTokenBalances(balances);
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    }, [publicKey, connection]);

    useEffect(() => {
        fetchTokenBalances();
    }, [fetchTokenBalances, fromToken, toToken]);

    const formatBalance = (balance: number | undefined) => {
        if (balance === undefined) return "0.0000";
        return balance.toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        });
    };

    const handleMaxClick = () => {
        const balance = tokenBalances[fromToken] || 0;
        setFromAmount(balance.toString());
        setToAmount(calculateAmount(balance.toString(), fromToken, toToken));
    };

    // Функция для получения символа токена по адресу
    const getTokenSymbol = (address: string) => {
        const token = tokens.find((t) => t.address === address);
        return token ? token.symbol : "SELECT TOKEN";
    };

    const handleOpenTokenSelect = (type: "from" | "to") => {
        setSelectingTokenFor(type);
        setTokenSelectModalOpen(true);
    };

    const handleTokenSelect = (tokenAddress: string) => {
        if (selectingTokenFor === "from") {
            setFromToken(tokenAddress);
            if (fromAmount) {
                setToAmount(calculateAmount(fromAmount, tokenAddress, toToken));
            }
        } else if (selectingTokenFor === "to") {
            setToToken(tokenAddress);
            if (toAmount) {
                setFromAmount(
                    calculateAmount(toAmount, tokenAddress, fromToken)
                );
            }
        }
        setTokenSelectModalOpen(false);
        setSelectingTokenFor(null);
    };

    const handleSwap = async () => {
        if (!publicKey || !signTransaction || !fromAmount) return;

        setIsSwapping(true);
        setError(null);

        try {
            console.log("Starting swap with params:", {
                fromToken,
                toToken,
                fromAmount,
            });
            // 1. Создаем транзакцию
            const { transaction, signers, expectedAmount } =
                await createSwapTransaction({
                    connection,
                    fromToken,
                    toToken,
                    fromAmount: parseFloat(fromAmount),
                    wallet: publicKey,
                    slippage: 1, // 1%
                });
            console.log(
                "Swap transaction created, expected amount:",
                expectedAmount
            );
            // 2. Подписываем транзакцию
            const signedTx = await signTransaction(transaction);

            // 3. Отправляем транзакцию
            const signature = await connection.sendRawTransaction(
                signedTx.serialize()
            );
            console.log("Transaction sent with signature:", signature);
            // 4. Ждем подтверждения
            await connection.confirmTransaction(signature);

            // 5. Обновляем балансы
            await fetchTokenBalances();
            setSuccess(true);
        } catch (err) {
            console.error("Swap error:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsSwapping(false);
        }
    };

    // Функция для расчета суммы
    const calculateAmount = (amount: string, from: string, to: string) => {
        const fromSymbol = getTokenSymbol(from).toLowerCase();
        const toSymbol = getTokenSymbol(to).toLowerCase();

        const fromPrice = prices[fromSymbol]?.usd || 0;
        const toPrice = prices[toSymbol]?.usd || 0;

        if (fromPrice && toPrice && amount) {
            return ((+amount * fromPrice) / toPrice).toFixed(6);
        }
        return "";
    };

    // Обработчик изменения fromAmount
    const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFromAmount(value);
        setToAmount(calculateAmount(value, fromToken, toToken));
    };

    // Обработчик изменения toAmount
    const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setToAmount(value);
        setFromAmount(calculateAmount(value, toToken, fromToken));
    };

    // Обновляем handleSwapTokens
    const handleSwapTokens = () => {
        const tempToken = fromToken;
        const tempAmount = fromAmount;
        setFromToken(toToken);
        setFromAmount(toAmount);
        setToToken(tempToken);
        setToAmount(tempAmount);
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 480, mx: "auto" }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
                Swap
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    From
                </Typography>
                <Box sx={{ position: "relative", mb: 2 }}>
                    <TextField
                        fullWidth
                        value={fromAmount}
                        onChange={handleFromAmountChange}
                        type="number"
                        placeholder="0.0"
                        InputProps={{
                            inputProps: {
                                style: { paddingRight: "100px" }, // Добавляем отступ справа
                            },
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            right: 12,
                            top: "30%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pointerEvents: "none", // Чтобы не мешало вводу
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ fontSize: "0.875rem" }}
                        >
                            Balance: {formatBalance(tokenBalances[fromToken])}
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            onClick={handleMaxClick}
                            sx={{
                                minWidth: "auto",
                                p: "2px 8px",
                                fontSize: "0.75rem",
                                color: "primary.main",
                                "&:hover": {
                                    backgroundColor: "rgba(103, 58, 183, 0.1)",
                                },
                                pointerEvents: "auto", // Возвращаем кликабельность кнопке
                            }}
                        >
                            MAX
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenTokenSelect("from")}
                        sx={{ minWidth: 120 }}
                    >
                        {fromToken ? getTokenSymbol(fromToken) : "SELECT TOKEN"}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <IconButton onClick={handleSwapTokens}>
                    <SwapVertIcon />
                </IconButton>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    To
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        value={toAmount}
                        onChange={handleToAmountChange}
                        type="number"
                        placeholder="0.0"
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleOpenTokenSelect("to")}
                        sx={{ minWidth: 120 }}
                    >
                        {toToken ? getTokenSymbol(toToken) : "SELECT TOKEN"}
                    </Button>
                </Box>
            </Box>

            <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSwap}
                disabled={
                    !fromToken ||
                    !toToken ||
                    !fromAmount ||
                    !toAmount ||
                    isSwapping ||
                    !publicKey
                }
            >
                {isSwapping ? <CircularProgress size={24} /> : "SWAP"}
            </Button>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success">Swap successful!</Alert>
            </Snackbar>
            <TokenSelectModal
                open={tokenSelectModalOpen}
                onClose={() => {
                    setTokenSelectModalOpen(false);
                    setSelectingTokenFor(null);
                }}
                onSelect={handleTokenSelect}
                selectedToken={
                    selectingTokenFor === "from" ? fromToken : toToken
                }
            />
        </Paper>
    );
};

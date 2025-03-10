import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchTokensList, TokenInfo } from "../api/jupiter";

type TokenAddresses = {
    [key: string]: string;
};

// Список официальных и проверенных токенов
const VERIFIED_TOKENS: TokenAddresses = {
    SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USD Coin
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Tether
    ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // Ethereum (Wormhole)
    BTC: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // Bitcoin (Wormhole)
    RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // Raydium
    ORCA: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", // Orca
    mSOL: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", // Marinade Staked SOL
    stSOL: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", // Lido Staked SOL
    BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Bonk
};

// Время жизни кэша (1 час)
const CACHE_LIFETIME = 60 * 60 * 1000;

export function useTokens() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFromCache = useCallback(() => {
        try {
            const cachedData = localStorage.getItem("tokensList");
            const cacheTimestamp = localStorage.getItem("tokensListTimestamp");

            if (cachedData && cacheTimestamp) {
                const isExpired =
                    Date.now() - Number(cacheTimestamp) > CACHE_LIFETIME;
                if (!isExpired) {
                    const parsedTokens = JSON.parse(cachedData);
                    if (
                        Array.isArray(parsedTokens) &&
                        parsedTokens.length > 0
                    ) {
                        return parsedTokens;
                    }
                }
            }
        } catch (error) {
            console.warn("Cache reading error:", error);
        }
        return null;
    }, []);

    const saveToCache = useCallback((tokensList: TokenInfo[]) => {
        try {
            localStorage.setItem("tokensList", JSON.stringify(tokensList));
            localStorage.setItem("tokensListTimestamp", Date.now().toString());
        } catch (error) {
            console.warn("Cache writing error:", error);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadTokens = async () => {
            try {
                setLoading(true);
                setError(null);

                const cachedTokens = loadFromCache();
                if (cachedTokens) {
                    setTokens(cachedTokens);
                    setLoading(false);
                    return;
                }

                const tokensList = await fetchTokensList();
                const verifiedAddresses = Object.values(VERIFIED_TOKENS);

                // Фильтруем только верифицированные токены по адресу
                const filteredTokens = tokensList
                    .filter((token) =>
                        verifiedAddresses.includes(token.address)
                    )
                    .sort((a, b) => {
                        const aIndex = verifiedAddresses.indexOf(a.address);
                        const bIndex = verifiedAddresses.indexOf(b.address);
                        return aIndex - bIndex;
                    });

                if (mounted) {
                    setTokens(filteredTokens);
                    saveToCache(filteredTokens);
                }
            } catch (err) {
                console.error("Token loading error:", err);
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load tokens"
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTokens();

        return () => {
            mounted = false;
        };
    }, [connection, publicKey, loadFromCache, saveToCache]);

    return { tokens, loading, error };
}

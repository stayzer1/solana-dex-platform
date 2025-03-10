import { useState, useEffect } from "react";
import { fetchTokenPrices } from "../api/prices";

interface TokenPrice {
    [key: string]: {
        usd: number;
        usd_24h_change?: number;
    };
}
const COINGECKO_IDS: { [key: string]: string } = {
    SOL: "solana",
    USDC: "usd-coin",
    USDT: "tether",
    ETH: "ethereum",
    BTC: "wrapped-bitcoin", // изменили с 'bitcoin'
    RAY: "raydium",
    ORCA: "orca",
    mSOL: "msol",
    stSOL: "lido-staked-sol",
    BONK: "bonk",
};

export function useTokenPrices(symbols: string[]) {
    const [prices, setPrices] = useState<TokenPrice>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const fetchPrices = async () => {
            if (!symbols || symbols.length === 0) {
                setPrices({});
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Фильтруем undefined и пустые значения
                const validSymbols = symbols.filter(
                    (s) => s && COINGECKO_IDS[s]
                );
                if (validSymbols.length === 0) {
                    if (mounted) {
                        setPrices({});
                        setLoading(false);
                    }
                    return;
                }

                const geckoIds = symbols
                    .map((symbol) => COINGECKO_IDS[symbol])
                    .filter(Boolean);

                const data = await fetchTokenPrices(geckoIds);

                if (mounted) {
                    // Преобразуем ответ обратно в формат с символами
                    const formattedPrices: TokenPrice = {};
                    symbols.forEach((symbol) => {
                        const geckoId = COINGECKO_IDS[symbol];
                        if (data[geckoId]) {
                            formattedPrices[symbol.toLowerCase()] = {
                                usd: data[geckoId].usd,
                                usd_24h_change: data[geckoId].usd_24h_change,
                            };
                        }
                    });
                    setPrices(formattedPrices);
                }
            } catch (err) {
                console.error("Price fetching error:", err);
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to fetch prices"
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchPrices();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [symbols.join(",")]);

    return { prices, loading, error };
}

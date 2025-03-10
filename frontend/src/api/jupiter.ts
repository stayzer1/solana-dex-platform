import { Connection, PublicKey } from "@solana/web3.js";

export interface TokenInfo {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
    balance?: number;
    chainId?: number;
    tags?: string[];
    extensions?: {
        coingeckoId?: string;
        website?: string;
        serumV3Usdc?: string;
    };
}
const JUPITER_TOKEN_LIST_URL = "https://cache.jup.ag/tokens";

export async function fetchTokensList(): Promise<TokenInfo[]> {
    try {
        const response = await fetch(JUPITER_TOKEN_LIST_URL, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            mode: "cors",
            credentials: "omit",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: expected an array");
        }

        return data;
    } catch (error) {
        console.error("Detailed fetch error:", error);
        throw error;
    }
}

export async function getTokenBalance(
    connection: Connection,
    tokenAddress: string,
    walletAddress: string
): Promise<number> {
    try {
        const walletPublicKey = new PublicKey(walletAddress);
        const tokenPublicKey = new PublicKey(tokenAddress);

        const response = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { mint: tokenPublicKey }
        );
        // Здесь будет логика получения баланса
        return 0; // Временно возвращаем 0
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0;
    }
}

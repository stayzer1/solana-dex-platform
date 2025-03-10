import { PublicKey } from "@solana/web3.js";

interface PoolInfo {
    id: PublicKey;
    tokenA: string;
    tokenB: string;
    tokenADecimals: number;
    tokenBDecimals: number;
}

export interface PoolsConfig {
    [key: string]: PoolInfo;
}

export const ORCA_POOL_PROGRAM_ID = new PublicKey(
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP"
);

export const POOLS: PoolsConfig = {
    "SOL/USDC": {
        id: new PublicKey("HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"),
        tokenA: "SOL",
        tokenB: "USDC",
        tokenADecimals: 9,
        tokenBDecimals: 6,
    },
    "USDC/SOL": {
        id: new PublicKey("HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"),
        tokenA: "USDC",
        tokenB: "SOL",
        tokenADecimals: 6,
        tokenBDecimals: 9,
    },
};
